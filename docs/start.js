
const artistsPath = "resources/artists.json";

// JSON読み込み
class JSONReader
{
    constructor()
    {
        this.jsonPath = "";
        this.data = [];
    }

    // JSON読み込み試行
    async TryRead(path)
    {
        this.jsonPath = path;
        try
        {
            const response = await fetch(path);
            this.data = await response.json();
            return true;
        }
        catch(error)
        {
            console.error("Couldn't read JSON!");
            return false;
        }
    }
}
let reader;

// 問題数設定スライダー
let slider;
// 問題数表示テキスト
let questionCountText;
// 最大値テキスト
let maxValueText;

// 選択肢ボタン
let artistButtons;


window.onload = async function ()
{
    // アーティスト情報読み込み
    reader = new JSONReader();
    if(!await reader.TryRead(artistsPath))
    {
        // 読み込み失敗
        alert("Error : Failed to load localdata");
    }

    // 問題数反映
    slider = document.getElementById("questionSlider");
    questionCountText = document.getElementById("questionCountText");
    maxValueText = document.getElementById("maxValue");

    UpdateCountText();
    // sliderの更新ごとに問題数テキストに反映
    slider.addEventListener('input', function(){ UpdateCountText(); });

    // 選択肢
    artistButtons = document.querySelectorAll('input[name="selectedArtist"]');
    artistButtons.forEach(function(button){
        button.addEventListener('change', function(){ 
            SliderValueToArtist(button.id); // スライダーにアーティストの曲数をセット
            UpdateCountText();              // "問題数"を更新
        });
    });

    // startボタン
    const startButton = document.getElementById("startButton");
    startButton.addEventListener("click", onClicked_startButton);
}

// startButtonが押されたとき
function onClicked_startButton()
{
    // 選択されたボタンを取得
    const selectedArtist = document.querySelector('input[name="selectedArtist"]:checked');

    if(selectedArtist)
    {
        // 問題数, id
        const gameParameter =
        {
            artistID : selectedArtist.id,
            questionCount : slider.value
        }

        // セッションストレージに保存
        sessionStorage.setItem("gameParameter", JSON.stringify(gameParameter));        

        // gamemainに遷移
        window.location.href = `gamemain.html`;
    }
    else
    {
        alert("Not Selected!!\n" + "選択してください");
    }
}

function UpdateCountText()
{
    if(!questionCountText || !slider) { return; }
    questionCountText.textContent = "問題数 : " + slider.value;
}

// 選択されたアーティストの曲数をスライダー最大値に
function SliderValueToArtist(artistID)
{
    if(!slider || !reader) { return; }

    // 仮
    let songs = 0;

    if(artistID == "artist0")
    {
        // 曲数取得
        songs = reader.data.find(item => item.artist === "Spitz").songs;
    }
    if(artistID == "artist1")
    {
        songs = reader.data.find(item => item.artist === "Kenshi Yonezu").songs;
    }

    // 最大値を更新
    slider.max = songs;
    maxValueText.textContent = songs.toString();
    // 中心の値に
    slider.value = slider.max / 2;
    // 超える場合は強制的に1
    if(slider.value > slider.max) { slider.value = 1; }
}