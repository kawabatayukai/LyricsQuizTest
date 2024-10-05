
window.onload = async function ()
{
    // titleボタン
    const titleButton = document.getElementById("titleButton");
    titleButton.addEventListener("click", onClicked_titleButton);

    // gamemainから渡されるデータ
    const param = GetResultParameter();

    // 正解数 〇/〇
    const correctResult = document.getElementById("correctResult");
    correctResult.textContent = param.correctCount.toString() + " / " + param.allQuestionCount.toString();

    // Time
    const time = document.getElementById("time");
    time.textContent ="TotalTime・・" + param.time.toString() + "s";

    // Avarage
    const avarage = document.getElementById("avarage");
    avarage.textContent ="Avarage・・" + param.avarage.toString() + "s";
}

// ページ遷移時のデータを取得
function GetResultParameter()
{
    const data = sessionStorage.getItem("resultParameter");
    sessionStorage.clear();
    if(data)
    {
        return JSON.parse(data);
    }
    
    // 取れないときは空を返す
    return {allQuestionCount:0, correctCount:0, time:0, avarage:0}
}

// titleButtonが押されたとき
function onClicked_titleButton()
{
    window.location.href = `start.html`;
}