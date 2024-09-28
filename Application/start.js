
window.onload = async function ()
{
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
        // gamemainに遷移
        window.location.href = `gamemain.html?artist=${encodeURI(selectedArtist.id)}`;
    }
    else
    {
        alert("Not Selected!!\n" + "選択してください");
    }
}