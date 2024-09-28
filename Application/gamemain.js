// jsonへのパス
const jsonPath = 
{
    spitz : "resources/output.json",
    yonezu : "resources/output_12795_yunezu.json"
}

// 効果音
const sounds = 
{
    correct : "resources/sounds/Correct.mp3",
    wrong : "resources/sounds/Wrong.mp3"
}
// 効果音を使用するか
let useSounds = true;

// 読み込んだデータ
let originData = [];

// 正解数表示のp要素
let correctCounter;
// 結果表示のp要素
let resultText;
// 問題文表示のp要素
let questionString;
// 解答選択肢のボタン
let answerLabels;
let answerButtons;
// 決定ボタン
let confirmButton;

// confitmButtonの機能
const confirmButtonModes = 
{
    confirm : "OK",
    next : "NEXT"
}

// 現在使用中の問題データ (構造体のように型定義したい!)
// question : 抽出した歌詞データ
// answers : 解答選択肢
// correctIndex : answersの正解の要素番号
let currentQuestion = 
{
    question : "", 
    answers : ["","",""],
    correctIndex : 0
}

let questionCounter =
{
    questionCount : 0,
    correctCount : 0
}


// 設定 
// TODO: startページから設定させる
const settings =
{
    // 抽出設定
    extractCount:20,

    // 総問題数
    allQuestionCount : 10,

    // クリアとする正解数  allQuestionCount >= clearCountであること
    clearCount : 10,
}

// 結果表示文字列(仮)
const resultTexts = 
{
    select : 
    {
        str : "( ・_・) SELECT THE ANSWER!",
        color : "blue"
    },
    correct : 
    {
        str : "( ^^) CORRECT!",
        color : "limegreen"
    },
    wrong : 
    {
        str : "( 'Д') WRONG!",
        color : "red"
    }
}

// 遷移時の値受け渡し取得
function GetQueryParameter()
{
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("artist");
}

function GetCurrentJson()
{
    const artistNum = GetQueryParameter();
    switch (artistNum)
    {
        case "artist0":
            return jsonPath.spitz;

        case "artist1":
            return jsonPath.yonezu;
    }

    return "";
}


// ページ読み込み時にjsonロード
window.onload = async function ()
{

    await LoadJson(GetCurrentJson());

    // 正解数
    correctCounter = document.getElementById("correctCounter");
    // 結果テキスト
    resultText = document.getElementById("resultText");
    // 問題文要素
    questionString  = document.getElementById("question");
    // 解答選択肢
    answerLabels = document.getElementsByClassName("answer");
    answerButtons = document.getElementsByName("selectedAnswer");
    // 決定ボタン
    confirmButton = document.getElementById("confirmButton");
    confirmButton.addEventListener("click", onClicked_confirmButton);

    // clearCountがallQuestionCountを超える場合, 調整する
    if (settings.clearCount > settings.allQuestionCount)
    {
        settings.clearCount = settings.allQuestionCount;
    }

    // 初回問題生成
    NextQuestion();
}

// json読み込み
async function LoadJson(json)
{
    try
    {
        const response = await fetch(json);
        originData = await response.json();
    }
    catch(error)
    {
        console.error("Load Error!", error);
        return null;
    }
}


// confirmButtonが押されたとき
function onClicked_confirmButton()
{
    if (ConfirmButtonMode() === confirmButtonModes.confirm)
    {
        ResponseToConfirm();
        return;
    }

    NextQuestion();
}

// "OK"選択時の応答
function ResponseToConfirm()
{
    // 選択されたボタンを取得
    const selectedAnswer = document.querySelector('input[name="selectedAnswer"]:checked');

    if(selectedAnswer)
    {
        const selectedId = selectedAnswer.id;

        if(selectedId === ("button" + currentQuestion.correctIndex.toString()))
        {
            // 正解
            SetResultText(resultTexts.correct);
            // 正解数の加算
            questionCounter.correctCount ++;
            SetCorrectCounterText();
            PlaySound(sounds.correct);
        }
        else
        {
            // 不正解
            SetResultText(resultTexts.wrong);
            PlaySound(sounds.wrong);
        }
        
        // ボタンの機能を"Next"に
        confirmButton.textContent = confirmButtonModes.next;

        // 問題数の加算
        questionCounter.questionCount++;

        // 終了
        if (questionCounter.correctCount >= settings.allQuestionCount)
        {
            alert("ALL CLEAR!");
            // TODO: リザルト画面へ
        }
    }
    else
    {
        alert("Not Selected!!\n" + "選択してください");
    }
}

// confirmButtonのモード プロパティ風
function ConfirmButtonMode(mode)
{
    // set
    if(mode)
    {
        confirmButton.textContent = mode;
    }

    // get (setでも返す)
    return confirmButton.textContent;
}

// 正解数テキストセット
function SetCorrectCounterText()
{
    correctCounter.textContent = (
        "Correct : " + 
        questionCounter.correctCount.toString() + 
        " / " +
        settings.allQuestionCount.toString()
    );
}

// 結果テキストセット
function SetResultText(result)
{
    resultText.textContent = result.str;
    resultText.style.color = result.color;
}

// ラジオボタンのチェックをすべて外す
function ClearRadioButtons()
{
    if(answerButtons.length <= 0) { return; }

    answerButtons.forEach(radio => {
        radio.checked = false;
    });
}


// 次の問題へ
function NextQuestion()
{
    ConfirmButtonMode(confirmButtonModes.confirm);
    ClearRadioButtons();
    ApplyQuestion();
    SetResultText(resultTexts.select);
    SetCorrectCounterText();
}

// 問題反映
function ApplyQuestion()
{
    currentQuestion = CreateQuestion();

    // 問題文
    questionString.textContent = currentQuestion.question;
    // 解答群
    for (let i = 0; i < answerLabels.length; i++)
    {
        answerLabels[i].querySelector("span").textContent = currentQuestion.answers[i];
    }
}

// 問題文生成
function CreateQuestion()
{
    const randomIndex = GetRandomNumber(0, (originData.length - 1));

    // 問題のデータ
    const data = originData[randomIndex];
    // originDataより削除
    originData = RemoveAt(originData, randomIndex);

    // 歌詞からランダムに抽出
    const lyrics = ExtractSubString(
        data.lyrics, 
        GetRandomNumber(0, data.lyrics.length),
        settings.extractCount
    );

    // 解答群生成用に曲名のみの配列を生成 (重複しない, 正解を取り除く)
    const songNames = originData.map((obj) => obj.songName);
    const fakeAnswers = [...new Set(songNames)].filter(item => item !== data.songName);
    const answers = CreateAnswers(data.songName, fakeAnswers.slice(), 3);

    return {
        question : lyrics,
        answers : answers.answers,
        correctIndex : answers.correctIndex
    }
}

// 解答群生成
function CreateAnswers(correctAnswer, fakeAnswers, answerCount)
{
    let answers = [];

    // 正解のindexをランダムに決める
    const answerIndex = GetRandomNumber(0, (answerCount - 1));

    for(let i = 0; i < answerCount; i++)
    {
        // 正解をセット
        if(i == answerIndex)
        {
            answers.push(correctAnswer);
            continue;
        }

        // fakeをセット
        const randomIndex = GetRandomNumber(0, (fakeAnswers.length - 1));
        answers.push(fakeAnswers[randomIndex]);

        // (fakeの重複防止) fake配列から削除
        fakeAnswers = RemoveAt(fakeAnswers, randomIndex);
    }

    return { answers : answers, correctIndex : answerIndex }
}

// 指定したindexの要素を削除した配列を返す
function RemoveAt(array, index)
{
    if(array.length <= 0) { return array; }
    if(index < 0) { return array; }
    if(index >= array.length) { return array; }

    let copied = array.slice();
    copied.splice(index, 1);
    return copied;
}

// 指定した開始位置と抽出数から文字列を切り出す
function ExtractSubString(str, beginIndex = 0, extractCount = 1)
{
    if(str.length <= extractCount) 
    {
        return str;
    }
    // 超える場合はbeginIndexをずらす
    if(beginIndex + extractCount > str.length)
    {
        beginIndex = str.length - extractCount;
    }

    return str.substring(beginIndex, beginIndex + extractCount);
}

// 乱数生成
function GetRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 効果音再生
function PlaySound(sound)
{
    if(!sound) { return; }

    new Audio(sound).play();
}