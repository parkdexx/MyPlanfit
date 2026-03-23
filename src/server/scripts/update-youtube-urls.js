const { pool } = require('../config/db');
require('dotenv').config();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchYoutubeUrl(exerciseName) {
  const apiKey = (process.env.YOUTUBE_API_KEY || '').replace(/^"|"$/g, '');
  const query = encodeURIComponent(`${exerciseName} 운동방법`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.items && data.items.length > 0) {
      return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
    }
    if (!response.ok) {
        console.error(`[API Error] ${data.error?.message}`);
    }
  } catch (err) {
    console.error(`[Fetch Error] ${err.message}`);
  }
  return null;
}

async function updateUrls() {
  console.log('🔄 YouTube 영상 URL 업데이트를 시작합니다...');

  try {
    // 1. 가져올 목록 조회 (youtube_url이 비어있거나 임시 값인 항목)
    const [rows] = await pool.query(
      "SELECT id, name FROM exercise_dictionary WHERE youtube_url IS NULL OR youtube_url = '' OR youtube_url LIKE 'https://youtube.com/watch?v=dlx%' OR youtube_url = 'https://youtube.com/watch?'"
    );

    console.log(`총 ${rows.length}개의 운동에 대해 업데이트를 진행합니다.`);

    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`[${i+1}/${rows.length}] ${row.name} 영상 검색 중...`);
        
        const videoUrl = await fetchYoutubeUrl(row.name);
        
        if (videoUrl) {
           await pool.query('UPDATE exercise_dictionary SET youtube_url = ? WHERE id = ?', [videoUrl, row.id]);
           console.log(`  ✅ 적용 완료: ${videoUrl}`);
           updatedCount++;
        } else {
           console.log(`  ❌ 결과 없음 또는 오류`);
           errorCount++;
        }

        // 제한 회피를 위해 약간의 딜레이
        await delay(300);
    }

    console.log(`\n✨ 업데이트 완료! (성공: ${updatedCount}, 실패: ${errorCount})`);
  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error);
  } finally {
    process.exit(0);
  }
}

updateUrls();
