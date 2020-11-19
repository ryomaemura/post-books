// #action-plan-postsに表示する関数
const createActionPlan = (actionPlanData) => {
  $('#action-plan-posts').prepend(
    $('<div>', {
      class: 'action-plan-box',
    }).append(
      $('<div>', {
        class: 'action-plan-box-left',
      }).append(
        $('<img>', {
          src: actionPlanData.bookItemData.bookThumbnail,
        }),
      ),
      $('<div>', {
        class: 'action-plan-box-right',
      }).append(
        $('<div>', {
          class: 'text-box',
        }).append(
          $('<h4>', {
            text: actionPlanData.actionPlan,
          }),
          $('<p>', {
            text: actionPlanData.actionPlanText,
          }),
        )
      )
    )
  );
};

// 投稿一覧を表示する関数
const loadActionPlanList = () => {
  const nowLoadingMessage = $('.now-loading');
  // $('#action-plan-posts').empty();
  nowLoadingMessage.text('読み込み中…');

  // 書籍データを取得
  const actionPlansRef = firebase
    .database()
    .ref('actionPlans');

  // 過去に登録したイベントハンドラを削除
  actionPlansRef.off('child_added');

  // イベントハンドラを登録
  actionPlansRef.on('child_added', (childSnapshot) => {
    // データ取得が完了すると実行
    nowLoadingMessage.text('');
    const actionPlanData = childSnapshot.val();
    // 書籍一覧画面に書籍データを表示
    createActionPlan(actionPlanData);
  });
};

loadActionPlanList();