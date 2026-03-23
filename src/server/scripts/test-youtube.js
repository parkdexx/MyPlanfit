require('dotenv').config();

async function testYouTube() {
  const apiKey = (process.env.YOUTUBE_API_KEY || '').replace(/^"|"$/g, '');

  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY가 환경 변수에 설정되어 있지 않습니다.');
    process.exit(1);
  }

  console.log(`Using API Key starting with: ${apiKey.substring(0, 10)}...`);
  
  const query = encodeURIComponent('벤치프레스 운동방법');
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.items && data.items.length > 0) {
      console.log('✅ 성공적으로 데이터를 가져왔습니다!');
      console.log(`비디오 제목: ${data.items[0].snippet.title}`);
      console.log(`비디오 링크: https://www.youtube.com/watch?v=${data.items[0].id.videoId}`);
      process.exit(0);
    } else if (response.ok && (!data.items || data.items.length === 0)) {
       console.log('ℹ️ 검색 결과가 없습니다.');
       process.exit(0);
    } else {
      console.error('❌ 검색 중 오류 발생:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 네트워크/예기치 못한 오류:', error.message);
    process.exit(1);
  }
}

testYouTube();
