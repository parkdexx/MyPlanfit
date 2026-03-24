const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { runCronJob } = require('../cron/youtubeUpdater');

/**
 * YouTube 업데이트 작업을 수동으로 즉시 실행하는 스크립트입니다.
 * 실행 방법: node src/server/scripts/run-updater.js
 */
async function start() {
    console.log('🚀 [Local Runner] YouTube 업데이트 작업을 시작합니다...');
    try {
        await runCronJob();
        console.log('✨ [Local Runner] 모든 작업이 성공적으로 완료되었습니다.');
        process.exit(0);
    } catch (error) {
        console.error('❌ [Local Runner] 작업 중 오류가 발생했습니다:', error);
        process.exit(1);
    }
}

start();
