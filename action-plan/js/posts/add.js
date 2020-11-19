// 書籍データ一覧
let bookDataList = [];
// 現在選択している書籍データ
let selectedBookData = {};

// Google Books API を使用してURLを送りJSON文字列を取得する関数
const searchGoogleBooksAPI = (url) => {
  $.getJSON(url, (data) => {
    console.log('data取得成功', data);
    booksDataView(data);
  });
};

// 検索された書籍データを表示する関数
const booksDataView = (books) => {
  $('#add-post-book-gallery').empty();
  bookDataList = [];
  selectedBookData = {};

  if (!books.items) {
    $('#add-post-book-gallery').append($('<h3>', {
      text: '検索結果が見つかりませんでした',
    }));
  } else {
    for (let i = 0; i < 10; i++) {
      // 表紙画像が存在しない場合の処理
      let booksItemsVolumeInfoImageLinks;
      if (!books.items[i].volumeInfo.imageLinks) {
        booksItemsVolumeInfoImageLinks = '../image/no-image.jpg';
      } else {
        booksItemsVolumeInfoImageLinks = books.items[i].volumeInfo.imageLinks.thumbnail;
      }

      bookDataList.push(books.items[i]);

      $('#add-post-book-gallery').append(
        $('<div>', {
          class: 'add-post-book-item',
        }).append(
          $('<div>', {
            class: 'add-post-book-item-left',
          }).append(
            $('<div>', {
              class: 'add-post-book-item-check-area',
            }).append(
              $('<input>', {
                class: 'add-post-book-item-check-box',
                type: 'radio',
                name: 'book-select',
                value: i,
              }),
              $('<p>', {
                text: '選択',
              })
            ),
            $('<img>', {
              src: booksItemsVolumeInfoImageLinks,
              alt: books.items[i].volumeInfo.title,
            })
          ),
          $('<div>', {
            class: 'add-post-book-item-right',
          }).append(
            $('<h4>', {
              text: books.items[i].volumeInfo.title,
            }),
            $('<h5>', {
              text: books.items[i].volumeInfo.authors,
            }),
            $('<h6>', {
              text: books.items[i].volumeInfo.description,
            }),
            $('<a>', {
              class: 'google-books-link-button',
              text: 'Show Detail',
              href: books.items[i].volumeInfo.previewLink,
            })
          )
        )
      );
    }
  }
}

const checkBookItemData = (bookItemData) => {
  if (!bookItemData.hasOwnProperty('volumeInfo')) {
    bookItemData.volumeInfo = {};
  }

  if (!bookItemData.volumeInfo.hasOwnProperty('title')) {
    bookItemData.volumeInfo.title = '';
  }

  if (!bookItemData.volumeInfo.hasOwnProperty('authors')) {
    bookItemData.volumeInfo.authors = [''];
  }

  if (!bookItemData.volumeInfo.hasOwnProperty('description')) {
    bookItemData.volumeInfo.description = '';
  }

  if (!bookItemData.volumeInfo.hasOwnProperty('previewLink')) {
    bookItemData.volumeInfo.previewLink = '';
  }

  if (!bookItemData.volumeInfo.hasOwnProperty('imageLinks')) {
    bookItemData.volumeInfo.imageLinks = {};
  }

  if (!bookItemData.volumeInfo.imageLinks.hasOwnProperty('thumbnail')) {
    bookItemData.volumeInfo.imageLinks.thumbnail = '../image/no-image.jpg';
  }

  if (!bookItemData.hasOwnProperty('id')) {
    bookItemData.id = '';
  }

  return bookItemData;
};

// アクションプラン投稿関数
const actionPlanPost = (bookItemData, actionPlan, actionPlanText) => {
  // 存在しないプロパティをチェック
  bookItemData = checkBookItemData(bookItemData);
  // actionPlanDataを作成
  const actionPlanData = {
    // 書籍情報
    bookItemData: {
      bookTitle: bookItemData.volumeInfo.title, // 書籍タイトル
      bookAuthors: bookItemData.volumeInfo.authors, // 著者名(配列)
      bookDescription: bookItemData.volumeInfo.description, // 書籍詳細テキスト
      bookShowDetailLink: bookItemData.volumeInfo.previewLink, // GoogleBooksURL
      bookThumbnail: bookItemData.volumeInfo.imageLinks.thumbnail, // 書籍の表紙URL
      googleBooksId: bookItemData.id, // GoogleBooksID
    },
    actionPlan, // アクションプラン
    actionPlanText, // 補足テキスト
    achieve: '未達成', // 達成状況
    createdByUID: currentUID, // 作成したユーザーID
    createdAt: firebase.database.ServerValue.TIMESTAMP, // 作成時刻
  };

  // firebase.databaseに投稿
  firebase
    .database()
    .ref('actionPlans')
    .push(actionPlanData)
    .then(() => {
      // database投稿に成功した時の処理
      console.log('アクションプランの投稿に成功');
      formClear();
      bookDataList = [];
      selectedBookData = {};
      $('#add-post-book-gallery').empty();
      alertMessage('info', 'アクションプランの投稿に成功しました');
    })
    .catch((error) => {
      // database投稿に失敗した時の処理
      console.log('アクションプランの投稿に失敗');
      console.log(error);
      alertMessage('danger', 'アクションプランの投稿に失敗しました');
    });
};

// 書籍選択タブで書籍検索ボタンをクリックした場合の処理
$('#add-post-book-search-button').on('click', () => {
  const bookSearchText = $('#add-post-book-search-text-input').val();

  if (bookSearchText == '') {
    alertMessage('danger', 'フォームを入力して下さい');
    return false;
  }

  $('#add-post-book-gallery').empty();
  $('#add-post-book-gallery').append($('<h3>', {
    text: '検索中です…',
  }));

  const url = `https://www.googleapis.com/books/v1/volumes?q=${bookSearchText}`;

  searchGoogleBooksAPI(url);

  // 画面遷移を無効化
  return false;
});

// ラジオボタンをクリックした時に selectedBookData に選択した書籍データを代入
$(document).on('click', '.add-post-book-item-check-box', () => {
  selectedBookData = bookDataList[$("input[name='book-select']:checked").attr('value')];
});

// アクションプラン投稿ボタンを押した時の処理
$('#action-plan-post-button').on('click', () => {
  const actionPlan = $('#action-plan-input').val();
  const actionPlanText = $('#action-plan-text-input').val();

  if (actionPlan === '' || actionPlanText === '') {
    alertMessage('danger', 'フォームを入力して下さい');
    return false;
  }

  if (!Object.keys(selectedBookData).length) {
    alertMessage('danger', '書籍を選択して下さい');
    return false;
  }

  actionPlanPost(selectedBookData, actionPlan, actionPlanText);
  return false;
});