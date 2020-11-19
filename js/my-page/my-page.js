// 投稿したアクションプランの数
let myActionPlanNumber = 0;
// 達成したアクションプランの数
let achievedActionPlanNumber = 0;

const loadMyActionPlanRecord = () => {
  $('#action-plan-achieve').find('.post-number').text(`アクションプラン投稿数：${myActionPlanNumber}回`);
  $('#action-plan-achieve').find('.achieved-number').text(`アクションプラン達成数：${achievedActionPlanNumber}回`);
};

// アクションプラン一覧を表示する関数
const myActionPlanView = (actionPlanDataKey, actionPlanDataValue) => {
  let achieveButtonClass;

  myActionPlanNumber += 1;

  if (actionPlanDataValue.achieve === '未達成') {
    achieveButtonClass = 'achieve-button';
  } else {
    achieveButtonClass = 'achieve-button achieved';
    achievedActionPlanNumber += 1;
  }

  $('#my-action-plan-posts').prepend(
    $('<div>', {
      id: `action-plan-id-${actionPlanDataKey}`,
      class: 'my-action-plan-post',
    }).append(
      $('<img>', {
        src: actionPlanDataValue.bookItemData.bookThumbnail,
      }),
      $('<div>', {
        class: 'my-action-plan-texts',
      }).append(
        $('<h4>', {
          text: actionPlanDataValue.actionPlan,
        }),
        $('<p>', {
          text: actionPlanDataValue.actionPlanText,
        }),
        $('<div>', {
          class: achieveButtonClass,
          text: actionPlanDataValue.achieve,
          onclick: 'achieved(this)',
        })
      )
    )
  );

  loadMyActionPlanRecord();
};

// 達成・未達成ボタンを押した時の処理
const achieved = (achieveButton) => {
  let addNumber;
  let addText;
  // クリックしたボタンのアクションプランのIDを取得
  const achieveButtonId = $(achieveButton.closest('.my-action-plan-post')).attr('id').split('action-plan-id-')[1];

  if ($(achieveButton).text() === '未達成') {
    addNumber = 1;
    addText = '達成!';
  } else {
    addNumber = -1;
    addText = '未達成';
  }

  // アクションプラン達成数を「+1/-1」する
  achievedActionPlanNumber += addNumber;

  $(achieveButton).toggleClass('achieved');
  $(achieveButton).text(addText);

  // firebase.databaseに投稿
  firebase
    .database()
    .ref(`actionPlans/${achieveButtonId}/achieve`)
    .set(addText);

  loadMyActionPlanRecord();
};

$('.now-loading').text('読み込み中…');

// 過去の自分の投稿一覧を表示する関数
firebase
  .database()
  .ref('actionPlans')
  .on('child_added', (childSnapshot) => {
    // データ取得が完了すると実行
    $('.now-loading').text('');
    const actionPlanDataKey = childSnapshot.key;
    const actionPlanDataValue = childSnapshot.val();
    if (actionPlanDataValue.createdByUID === currentUID) {
      myActionPlanView(actionPlanDataKey, actionPlanDataValue);
    }
    loadMyActionPlanRecord();
  });