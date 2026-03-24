const cron = require('node-cron');
const { pool } = require('../config/db');
require('dotenv').config();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// OEmbed API 호출 최적화를 위한 GET (HEAD 대신 GET을 쓰는 것이 더 확실할 수 있음)
// ISO 8601 Duration (ex: PT5M30S, PT1H2M10S) 을 초(second) 단위로 파싱하는 정규식
const parseISO8601Duration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};

// 1. 기존 DB 영상들 생존 여부 확인
async function validateExistingUrls() {
  console.log('[Validator] 기존 YouTube URL 유효성 검증 시작...');
  const [rows] = await pool.query(
    "SELECT id, youtube_url FROM exercise_dictionary WHERE youtube_url IS NOT NULL AND youtube_url != ''"
  );
  
  let invalidCount = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // 더미 URL은 여기서 검증 생략 (어차피 2번 로직에서 갈아치움)
    if (row.youtube_url.includes('dlx')) continue;

    const checkUrl = `https://www.youtube.com/oembed?format=json&url=${row.youtube_url}`;
    try {
      const response = await fetch(checkUrl);
      // 만약 oembed API가 400, 401, 404 등을 던진다면 -> 삭제되거나 비공개된 영상
      if (!response.ok) {
         console.log(`[Validator] 💔 유효하지 않은 영상 발견 (ID: ${row.id}): ${row.youtube_url}`);
         await pool.query('UPDATE exercise_dictionary SET youtube_url = NULL WHERE id = ?', [row.id]);
         invalidCount++;
      }
    } catch (e) {
      console.error(`[Validator Error] ${row.youtube_url}: ${e.message}`);
    }
    
    // YouTube API Limit 회피
    await delay(100);
  }
  console.log(`[Validator] 검증 완료. ${invalidCount}개의 삭제/비공개된 영상을 제거했습니다.`);
}

// 2. 30분 미만의 영상을 찾아서 리턴
async function fetchYoutubeUrl(exerciseName) {
  const apiKey = (process.env.YOUTUBE_API_KEY || '').replace(/^"|"$/g, '');
  
  // '정확한 자세' 등 검색 쿼리 튜닝으로 퀄리티 상향 (다만 너무 붙이면 안나올수도 있으니 '운동방법'으로 유지)
  const query = encodeURIComponent(`${exerciseName} 올바른 자세 가이드`); 
  
  // 최대 5개를 가져온 후 이 중에서 30분 미만인 것을 고름
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${query}&type=video&key=${apiKey}`;

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchRes.ok && searchData.items && searchData.items.length > 0) {
      // 5개 영상의 ID 목록 추출
      const videoIds = searchData.items.map(item => item.id.videoId);
      
      // videos 엔드포인트에 쿼리하여 contentDetails(시간정보) 확보
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      
      if (detailsRes.ok && detailsData.items) {
          // 검색된 순서(인기도/관련도)대로 30분 미만(1800초)인지 확인
          for (let i = 0; i < searchData.items.length; i++) {
              const videoId = searchData.items[i].id.videoId;
              const details = detailsData.items.find(d => d.id === videoId);
              
              if (details) {
                  const durationInSeconds = parseISO8601Duration(details.contentDetails.duration);
                  // 동영상 길이가 1초 이상, 1800초(30분) 미만이면 바로 채택!
                  if (durationInSeconds > 0 && durationInSeconds < 1800) {
                      return `https://www.youtube.com/watch?v=${videoId}`;
                  }
              }
          }
      }
    } else if (!searchRes.ok) {
        console.error(`[API Error] ${searchData.error?.message}`);
    }
  } catch (err) {
    console.error(`[Fetch Error] ${err.message}`);
  }
  return null;
}

// 3. 비어있는 영상 새롭게 채우기
async function updateUrls() {
  console.log('[Updater] YouTube 영상 매칭 검색 시작...');
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM exercise_dictionary WHERE youtube_url IS NULL OR youtube_url = '' OR youtube_url LIKE 'https://youtube.com/watch?v=dlx%' OR youtube_url = 'https://youtube.com/watch?'"
    );

    console.log(`총 ${rows.length}개의 빈 영상 슬롯에 대해 30분 미만의 영상을 탐색합니다.`);

    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`[${i+1}/${rows.length}] ${row.name} 탐색 중...`);
        
        const videoUrl = await fetchYoutubeUrl(row.name);
        
        if (videoUrl) {
           await pool.query('UPDATE exercise_dictionary SET youtube_url = ? WHERE id = ?', [videoUrl, row.id]);
           console.log(`  ✅ 매칭 성공: ${videoUrl}`);
           updatedCount++;
        } else {
           console.log(`  ❌ 적합한(30분 미만) 영상을 찾지 못함`);
           errorCount++;
        }
        await delay(300);
    }
    console.log(`\n✨ 전체 업데이트 작업 완료! (성공: ${updatedCount}, 실패(없음): ${errorCount})`);
  } catch (error) {
    console.error('❌ 업데이트 실행 실패:', error);
  }
}

// 메인 실행 함수
async function runCronJob() {
    console.log('--- 📺 시스템: YouTube 자동화 스케줄 작업 시작 ---');
    await validateExistingUrls();
    await updateUrls();
    console.log('--- 📺 시스템: YouTube 자동화 스케줄 작업 정상 종료 ---');
}

/**
 * 유튜브 URL 업데이트 크론 작업을 생성하고 반환합니다.
 * index.js 에서 받아서 종료 처리에 사용합니다.
 */
function initYoutubeCron() {
  // 매일 새벽 1시에 동작
  const task = cron.schedule('0 1 * * *', () => {
    runCronJob();
  });
  
  console.log('⏰ YouTube Cron Scheduler 등록 성공 (매일 새벽 1시 구동)');
  return task;
}

module.exports = {
  initYoutubeCron,
  runCronJob
};
