const { pool } = require('../config/db');

async function cleanDummyUrls() {
  try {
    const [result] = await pool.query(
      "UPDATE exercise_dictionary SET youtube_url = '' WHERE youtube_url LIKE '%dlx%' OR youtube_url = 'https://youtube.com/watch?'"
    );
    console.log(`✅ ${result.affectedRows}개의 더미 URL을 빈 값으로 초기화했습니다.`);
  } catch (error) {
    console.error('❌ 더미 URL 초기화 오류:', error);
  } finally {
    process.exit(0);
  }
}

cleanDummyUrls();
