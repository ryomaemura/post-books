// main.jsは全てのページで共通で行う処理を記述

// 現在ログインしているユーザーIDを保存する変数
let currentUID = null;
// alert関数の実行数を保存する変数
let isAlert = 0;

// #alertにメッセージを表示する関数
const alertMessage = (color, message) => {
  const $alert = $('#alert');
  $alert.css('display', 'none');
  $alert.attr('class', 'alert');
  $alert.addClass(`alert-${color}`);
  $alert.text(message);
  $alert.slideDown(200);
  isAlert += 1;
  setTimeout(() => {
    isAlert -= 1;
    if (!(isAlert)) {
      $alert.css('display', 'none');
      $alert.removeClass(`alert-${color}`);
    }
  }, 4000);
};

// サインアップを行う関数
const signUp = (userName, emailAddress, password) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(emailAddress, password)
    .then((userData) => {
      // サインアップに成功した時の処理
      console.log('サインアップ成功', userData);
      formClear();
      // サインアップアラートを表示
      alertMessage('success', 'サインアップに成功しました');
      currentUID = userData.user.uid;
      createSignUpUserData(currentUID, userName, emailAddress);
    })
    .catch((error) => {
      // サインアップに失敗した時の処理
      console.log('サインアップエラー', error);
      alertMessage('danger', 'サインアップに失敗しました');
    });
};

// usersデータを登録する
const createSignUpUserData = (signUpUID, userName, emailAddress) => {
  const userData = {
    userName,
    mailAddress: emailAddress,
  }

  firebase
    .database()
    .ref(`users/${signUpUID}`)
    .set(userData)
    .then(() => {
      console.log('ユーザーデータ登録完了');
    })
    .catch((error) => {
      console.log('ユーザーデータ登録エラー', error);
    });
};

// ログインを行う関数
const logIn = (emailAddress, password) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(emailAddress, password)
    .then((user) => {
      // ログインに成功した時の処理
      console.log('ログイン成功', user);
      formClear();
      // ログインアラートを表示
      alertMessage('primary', 'ログインに成功しました');
    })
    .catch((error) => {
      // ログインに失敗した時の処理
      console.log('ログインエラー', error);
      alertMessage('danger', 'メールアドレスかパスワードが間違っています');
    });
};

// ログアウトを行う関数
const logOut = () => {
  // ログアウトを実行(signOut())
  firebase.auth().signOut()
    .then(() => {
      // ログアウト成功時の処理
      console.log('ログアウトしました');
      alertMessage('primary', 'ログアウトしました');
      location.href = '/action-plan/posts/';
    })
    .catch((error) => {
      // ログアウト失敗時の処理
      console.log('ログアウトエラー', error);
    });
};

// ログイン/ログアウト状態によってblock/noneを切り替える関数
const changeView = () => {
  if (currentUID != null) {
    // ログイン状態の処理
    $('.visible-on-login').css('display', 'block');
    $('.visible-on-logout').css('display', 'none');
  } else {
    // ログアウト状態の処理
    $('.visible-on-logout').css('display', 'block');
    $('.visible-on-login').css('display', 'none');
  }
};

// フォームモーダルの内容を削除する関数
const formClear = () => {
  // フォームの内容を削除する処理
  $('form input, textarea').val('');
  // モーダルを削除する処理
  $('body').removeClass('modal-open');
  $('.modal-backdrop').remove();
  $('.modal').modal('hide');
}

// ログイン状態の変化を監視する
// ユーザーのログイン状況が変化したら起動する関数(onAuthStateChanged())
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // ログインした場合の処理
    console.log('状態:ログイン中', user);
    currentUID = user.uid;
    changeView();
  } else {
    // ログインしていない場合の処理
    console.log('状態:ログアウト');
    currentUID = null;
    changeView();
  }
});

// サインアップフォームのサインアップボタンを押した時の処理
$('#sign-up-button').on('click', () => {
  const signUpUserName = $('sign-up-user-name').val();
  const signUpEmailAddress = $('#sign-up-email-address').val();
  const signUpPassword = $('#sign-up-password').val();

  signUp(signUpUserName, signUpEmailAddress, signUpPassword);

  // submit後の画面遷移を無効化
  return false;
});

// ログインフォームのログインボタンを押した時の処理
$('#login-button').on('click', () => {
  const logInEmailAddress = $('#login-email-address').val();
  const logInPassword = $('#login-password').val();

  logIn(logInEmailAddress, logInPassword);

  // submit後の画面遷移を無効化
  return false;
});

// ログアウトボタンを押した時の処理
$('#logout-button').on('click', () => {
  logOut();
});