const { pool } = require('../config/db');

async function insertExercises() {
  console.log('🔄 새로운 운동 데이터를 삽입합니다...\n');

  const newExercises = [
    // 가슴 (Chest)
    { name: '인클라인 벤치프레스', bodyPart: '가슴,어깨', url: '' },
    { name: '디클라인 벤치프레스', bodyPart: '가슴,어깨', url: '' },
    { name: '덤벨 프레스', bodyPart: '가슴,어깨', url: '' },
    { name: '인클라인 덤벨 프레스', bodyPart: '가슴,어깨', url: '' },
    { name: '디클라인 덤벨 프레스', bodyPart: '가슴,어깨', url: '' },
    { name: '덤벨 플라이', bodyPart: '가슴', url: '' },
    { name: '펙 덱 플라이', bodyPart: '가슴', url: '' },
    { name: '케이블 크로스오버', bodyPart: '가슴', url: '' },
    { name: '체스트 프레스 머신', bodyPart: '가슴', url: '' },
    { name: '딥스', bodyPart: '가슴,팔', url: '' },
    { name: '인클라인 푸시업', bodyPart: '가슴', url: '' },
    { name: '디클라인 푸시업', bodyPart: '가슴', url: '' },
    { name: '덤벨 풀오버', bodyPart: '가슴,등', url: '' },

    // 등 (Back)
    { name: '친업', bodyPart: '등,팔', url: '' },
    { name: '바벨 로우', bodyPart: '등', url: '' },
    { name: '덤벨 로우', bodyPart: '등', url: '' },
    { name: '시티드 케이블 로우', bodyPart: '등', url: '' },
    { name: '티바 로우', bodyPart: '등', url: '' },
    { name: '펜들레이 로우', bodyPart: '등', url: '' },
    { name: '인버티드 로우', bodyPart: '등', url: '' },
    { name: '데드리프트', bodyPart: '등,하체,코어', url: '' },
    { name: '루마니안 데드리프트', bodyPart: '등,하체', url: '' },
    { name: '백 익스텐션', bodyPart: '등,코어', url: '' },
    { name: '암 풀다운', bodyPart: '등', url: '' },
    { name: '어시스트 풀업', bodyPart: '등,팔', url: '' },
    { name: '머신 로우', bodyPart: '등', url: '' },
    { name: '슈러그', bodyPart: '등,어깨', url: '' },
    { name: '굿모닝', bodyPart: '등,하체', url: '' },

    // 하체 (Lower Body)
    { name: '프론트 스쿼트', bodyPart: '하체,코어', url: '' },
    { name: '고블릿 스쿼트', bodyPart: '하체,코어', url: '' },
    { name: '와이드 스쿼트', bodyPart: '하체', url: '' },
    { name: '런지', bodyPart: '하체', url: '' },
    { name: '워킹 런지', bodyPart: '하체', url: '' },
    { name: '리버스 런지', bodyPart: '하체', url: '' },
    { name: '불가리안 스플릿 스쿼트', bodyPart: '하체', url: '' },
    { name: '레그 익스텐션', bodyPart: '하체', url: '' },
    { name: '레그 컬', bodyPart: '하체', url: '' },
    { name: '카프 레이즈', bodyPart: '하체', url: '' },
    { name: '시티드 카프 레이즈', bodyPart: '하체', url: '' },
    { name: '브이 스쿼트', bodyPart: '하체', url: '' },
    { name: '핵 스쿼트', bodyPart: '하체', url: '' },
    { name: '힙 쓰러스트', bodyPart: '하체,코어', url: '' },
    { name: '글루트 브릿지', bodyPart: '하체,코어', url: '' },
    { name: '스티프 레그 데드리프트', bodyPart: '하체', url: '' },
    { name: '힙 어덕션 (이너타이)', bodyPart: '하체', url: '' },
    { name: '힙 어브덕션 (아웃타이)', bodyPart: '하체', url: '' },
    { name: '케이블 글루트 킥백', bodyPart: '하체', url: '' },
    { name: '덩키 킥', bodyPart: '하체', url: '' },
    { name: '글루트 햄 레이즈', bodyPart: '하체', url: '' },
    { name: '스모 데드리프트', bodyPart: '하체,등', url: '' },
    { name: '머신 힙 프레스', bodyPart: '하체', url: '' },

    // 어깨 (Shoulder)
    { name: '덤벨 숄더 프레스', bodyPart: '어깨', url: '' },
    { name: '아놀드 프레스', bodyPart: '어깨', url: '' },
    { name: '사이드 레터럴 레이즈', bodyPart: '어깨', url: '' },
    { name: '케이블 레터럴 레이즈', bodyPart: '어깨', url: '' },
    { name: '프론트 레이즈', bodyPart: '어깨', url: '' },
    { name: '케이블 프론트 레이즈', bodyPart: '어깨', url: '' },
    { name: '벤트 오버 레터럴 레이즈', bodyPart: '어깨', url: '' },
    { name: '숄더 프레스 머신', bodyPart: '어깨', url: '' },
    { name: '페이스 풀', bodyPart: '어깨,등', url: '' },
    { name: '비하인드 넥 프레스', bodyPart: '어깨', url: '' },
    { name: '업라이트 로우', bodyPart: '어깨,등', url: '' },
    { name: '리어 델토이드 머신 / 리버스 펙덱 플라이', bodyPart: '어깨,등', url: '' },
    { name: '원암 덤벨 프레스', bodyPart: '어깨', url: '' },

    // 팔 (Arm)
    { name: '덤벨컬', bodyPart: '팔', url: '' },
    { name: '해머컬', bodyPart: '팔', url: '' },
    { name: '이지바 컬 / EZ-바 컬', bodyPart: '팔', url: '' },
    { name: '프리쳐 컬', bodyPart: '팔', url: '' },
    { name: '컨센트레이션 컬', bodyPart: '팔', url: '' },
    { name: '케이블 해머 컬', bodyPart: '팔', url: '' },
    { name: '케이블 푸시다운', bodyPart: '팔', url: '' },
    { name: '트라이셉스 익스텐션', bodyPart: '팔', url: '' },
    { name: '라잉 트라이셉스 익스텐션 (스컬 크러셔)', bodyPart: '팔', url: '' },
    { name: '오버헤드 트라이셉스 익스텐션', bodyPart: '팔', url: '' },
    { name: '덤벨 킥백', bodyPart: '팔', url: '' },
    { name: '클로즈 그립 벤치프레스', bodyPart: '팔,가슴', url: '' },
    { name: '벤치 딥스', bodyPart: '팔,가슴', url: '' },

    // 코어 (Core)
    { name: '크런치', bodyPart: '코어', url: '' },
    { name: '바이시클 크런치', bodyPart: '코어', url: '' },
    { name: '리버스 크런치', bodyPart: '코어', url: '' },
    { name: '레그 레이즈', bodyPart: '코어', url: '' },
    { name: '행잉 레그 레이즈', bodyPart: '코어', url: '' },
    { name: '윗몸 일으키기', bodyPart: '코어', url: '' },
    { name: '플랭크', bodyPart: '코어', url: '' },
    { name: '사이드 플랭크', bodyPart: '코어', url: '' },
    { name: '러시안 트위스트', bodyPart: '코어', url: '' },
    { name: '케이블 크런치', bodyPart: '코어', url: '' },
    { name: '데드버그', bodyPart: '코어', url: '' },
    { name: '마운틴 클라이머', bodyPart: '코어,유산소', url: '' },
    { name: '앱 롤아웃 / AB 슬라이드', bodyPart: '코어', url: '' },
    { name: '케이블 우드촙', bodyPart: '코어', url: '' },

    // 유산소 (Cardio)
    { name: '런닝머신 / 트레드밀', bodyPart: '유산소', url: '' },
    { name: '실내 사이클', bodyPart: '유산소', url: '' },
    { name: '스텝밀 / 천국의 계단', bodyPart: '유산소,하체', url: '' },
    { name: '로잉머신', bodyPart: '유산소,전신', url: '' },
    { name: '일립티컬', bodyPart: '유산소,전신', url: '' },
    { name: '트레드밀 인터벌', bodyPart: '유산소', url: '' },
    { name: '사이드 스텝', bodyPart: '유산소', url: '' },

    // 전신 (Full Body)
    { name: '버피 테스트', bodyPart: '전신,유산소', url: '' },
    { name: '케틀벨 스윙', bodyPart: '전신,하체,코어', url: '' },
    { name: '쓰러스터', bodyPart: '전신,코어', url: '' },
    { name: '파워 클린', bodyPart: '전신', url: '' },
    { name: '스내치 / 역도 인상', bodyPart: '전신', url: '' },
    { name: '배틀 로프', bodyPart: '전신,유산소', url: '' }
  ];

  let insertedCount = 0;
  let errorCount = 0;

  for (const ex of newExercises) {
    try {
      const [result] = await pool.query(
        'INSERT IGNORE INTO exercise_dictionary (name, body_part, youtube_url) VALUES (?, ?, ?)',
        [ex.name, ex.bodyPart, ex.url]
      );
      if (result.affectedRows > 0) {
        insertedCount++;
        console.log(`  ✅ 추가 완료: ${ex.name} (${ex.bodyPart})`);
      } else {
        console.log(`  ℹ️ 이미 존재함: ${ex.name}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`  ❌ 추가 실패: ${ex.name} -`, error.message);
    }
  }

  console.log(`\n✨ 총 ${insertedCount}개의 운동 데이터가 추가되었습니다. (오류: ${errorCount}개)`);
  process.exit(0);
}

insertExercises().catch(err => {
  console.error('❌ 스크립트 실행 실패:', err);
  process.exit(1);
});
