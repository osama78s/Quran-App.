// set current indext to make index of the surah to add details surah in page 
let currentIndex;
let newIndex;

// play and pause the radio 
let audio = document.getElementById('song');
function playAudio(){
    let radioSubmit = document.querySelector('.radio');
    
    radioSubmit.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            radioSubmit.innerHTML = ' إيقاف التشغيل<i class="fa-regular fa-stop-circle stop"></i>';
            radioSubmit.style.background = "#ffc107";
        } else {
            audio.pause();
            radioSubmit.innerHTML = 'تشغيل الراديو <i class="fa-regular fa-circle-play play"></i>';
            radioSubmit.style.background = "#2ca4ab";
        }
    });
}
playAudio();

// add swura in the page 
async function getSwura() {
    let chooseAyas = document.querySelector('.ayahs');
    let data_number;
    let ayahs;
    for (let i = 1; i <= 114; i++) {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${i}`);
        const data = await res.json();
        let dataName = data.data.name;
        data_number = data.data.number;
        ayahs = data.data.ayahs;
        let ayahsNum = data.data.ayahs.length;
        chooseAyas.innerHTML += `
        <div class="ayah" data-index="${data_number}">
            <div class="right">
                <div class="surah_num">
                    <span class="num">${i}</span>
                </div>
                <span class="name">${dataName}</span>
            </div>
            <div class="left">
                <span>${ayahsNum} آية</span>
            </div>
        </div> 
        `
    }
    let all_names = document.querySelectorAll('.ayah');
    all_names.forEach((name, index) =>{
        name.addEventListener('click', () =>{
            removeHidePage();
            addText(index);
            checkLocal();
            showReciters(index + 1);
            document.querySelector('.preload').style.display = 'block';
            document.querySelector('.adds').style.display = 'none';
            setTimeout(() => {
                document.querySelector('.preload').style.display = 'none';
                document.querySelector('.adds').style.display = 'block';
            }, 2500);
            currentIndex = index;
            newIndex = index;
            if (audio.play){
                audio.pause();
            }
        })
    });
}
getSwura();

// show reciters 
async function showReciters(index){
    const res = await fetch(`https://mp3quran.net/api/v3/reciters?language=ar`);
    const data = await res.json();
    const reciters = data.reciters;

    const selectorOptions = document.querySelectorAll('.selector option');
    selectorOptions.forEach((option) => {
    let dataIndex = parseInt(option.getAttribute('data-index'));

       reciters.forEach((reciter) => {
            if (reciter.id === dataIndex){
                option.innerHTML = `الشيخ ${reciter.name}`;
                let moshafs = reciter.moshaf;

                moshafs.forEach((moshaf) => {
                        if (reciter.id == moshaf.id){
                            let server = moshaf.server;
                            let surah_list = moshaf.surah_list;
                            let surahArray = surah_list.split(',');
                            surahArray.forEach((surah) => {
                                if (index == surah){
                                    const padSurah = surah.padStart(3, 0);
                                    if (option.dataset.index == '51'){
                                        option.value =  `${server}${padSurah}.mp3`;
                                        localStorage.setItem('saveValue', option.value);
                                    }
                                }
                            })
                        }
                    })
                }
            });
        });
}
showReciters();

let newValue;
 

async function changeSelectedIndex(selectedIndex) {
    try {
        const res = await fetch(`https://mp3quran.net/api/v3/reciters?language=ar`);
        const data = await res.json();
        const reciters = data.reciters;
        let titleSurah = document.querySelector('.adds .title .title');
        let titleIndex = parseInt(titleSurah.getAttribute('data-index'));

        let dataIndex = parseInt(selectedIndex.getAttribute('data-index'));
        for (let reciter of reciters) {
            if (reciter.id === dataIndex) {
                let moshafs = reciter.moshaf;
                    moshafs.forEach(moshaf => {
                        if (moshaf.name == 'المصحف المعلم - المصحف المعلم'){
                            return false;
                        } else{
                            let server = moshaf.server;
                            let surah_list = moshaf.surah_list;
                            let surahArray = surah_list.split(',');

                            for (let surah of surahArray) {
                                if (parseInt(surah) === titleIndex) { 
                                    const padSurah = surah.padStart(3, '0');
                                    newValue = `${server}${padSurah}.mp3`;
                                    selectedIndex.value = newValue;
                                    return; 
                                }
                            }
                        }
                            
                    })
            }
        }
    } catch (error) {
        console.error("Error fetching reciters:", error);
    }
}
function changeSrc() {
    let selector = document.querySelector('.selector');
    let audio = document.querySelector('.play_quran');
    let loadContent = document.querySelector('.load');
    let footer = document.querySelector('.adds .end');

    selector.addEventListener('change', () => {
        let selectedIndex = selector.options[selector.selectedIndex];

        audio.pause();
        audio.style.display = 'none';
        footer.style.padding = '15px';
        loadContent.innerHTML = 'تشغيل الصوت <i class="fa-regular fa-circle-play play"></i>';
        loadContent.style.color = "#2ca4ab";

        document.querySelectorAll('.selector option').forEach(option => {
            option.value = ''; 
        });

        changeSelectedIndex(selectedIndex).then(() => {

            // Flag to check if audio source has been set
            let isPlaying = false;
            let isLoaded = false; 
        
            loadContent.addEventListener('click', () => {
                if (!isPlaying) {
                    if (!isLoaded) {
                        audio.src = newValue;
                        isLoaded = true;
                    }
                    audio.style.display = 'block';
                    footer.style.padding = '17px';
                    audio.play();
                    isPlaying = true;
                    loadContent.innerHTML = 'إيقاف التشغيل <i class="fa-regular fa-stop-circle stop"></i>';
                    loadContent.style.color = "#ffc107";
                } else {
                    audio.pause();
                    isPlaying = false;
                    audio.style.display = 'none';
                    footer.style.padding = '15px';
                    loadContent.innerHTML = 'تشغيل الصوت <i class="fa-regular fa-circle-play play"></i>';
                    loadContent.style.color = "#2ca4ab";
                }
            });
        
            // Event listener for when audio playback ends
            audio.addEventListener('ended', () => {
                isPlaying = false;
                loadContent.innerHTML = 'تشغيل الصوت <i class="fa-regular fa-circle-play play"></i>';
                loadContent.style.color = "#2ca4ab";
                audio.style.display = 'none';
            });
        });
    });

}

// when click on the load 
function playQuran() {
    let audio = document.querySelector('.play_quran');
    let loadContent = document.querySelector('.load');
    let footer = document.querySelector('.adds .end');

    // Flag to check if audio source has been set
    let isPlaying = false;
    let isLoaded = false; 

    loadContent.addEventListener('click', () => {
        if (!isPlaying) {
            if (!isLoaded) {
                let selectorOptions = document.querySelector('.selector option');
                let value = selectorOptions.value;
                audio.src = value;
                isLoaded = true;
            }
            audio.style.display = 'block';
            footer.style.padding = '17px';
            audio.play();
            isPlaying = true;
            loadContent.innerHTML = 'إيقاف التشغيل <i class="fa-regular fa-stop-circle stop"></i>';
            loadContent.style.color = "#ffc107";
        } else {
            audio.pause();
            isPlaying = false;
            audio.style.display = 'none';
            footer.style.padding = '15px';
            loadContent.innerHTML = 'تشغيل الصوت <i class="fa-regular fa-circle-play play"></i>';
            loadContent.style.color = "#2ca4ab";
        }
    });

    // Event listener for when audio playback ends
    audio.addEventListener('ended', () => {
        isPlaying = false;
        loadContent.innerHTML = 'تشغيل الصوت <i class="fa-regular fa-circle-play play"></i>';
        loadContent.style.color = "#2ca4ab";
        audio.style.display = 'none';
    });


}

playQuran();
changeSrc();

// remove the hide div and add the adds div when click
function removeHidePage(){
    document.querySelector('.hide').style.display = 'none';
    document.querySelector('.adds').style.display = 'block';
    document.querySelector('.adds .header').style.display = 'block';
    document.querySelector('.adds .footer').style.display = 'block';
}

// check if the display is true or false
function checkLocal(){
    let adds = document.querySelector('.adds'); 
    let hide = document.querySelector('.hide'); 
    if (hide.style.display === 'none'){
        adds.style.display = 'block';
        localStorage.setItem('addPage', 'true');
    }else{
        adds.style.display = 'none';
        hide.style.display = 'block';
        localStorage.setItem('addPage', 'false');
    }
}

// add hide page 
function addHidePage(){
    document.querySelector(".hide").style.display = 'block';
    document.querySelector('.adds').style.display = 'none';
    document.querySelector('.adds .header').style.display = 'none';
    document.querySelector('.adds .footer').style.display = 'none';
}

// when click on quraan.net add hide page
document.querySelector('.adds .header .container .logo').addEventListener('click', () => {
    addHidePage();
    checkLocal();
    scrollTo({
        top: 0,
        behavior: "smooth"
    });
    location.reload();
    localStorage.remove('innerhtml');
});

// add text of ayahs
async function addText(index) {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${index + 1}`);
    const data = await res.json();
    const name = data.data.name;
    // add title to the page 
    let titleSurah = document.querySelector('.adds .title');
    titleSurah.innerHTML = `
    <h2 class="title" data-index="${index + 1}">${name}</h2>
    `
    // save title in localstorage
    localStorage.setItem('currentTitle', titleSurah.innerHTML);
    let ayahs = data.data.ayahs;

    let ayahText = document.querySelector('.ayah_text');
    ayahText.innerHTML = '';
    ayahs.forEach((ayah, index) => {
        ayahText.innerHTML += `
            <span class="text some-ar">${ayah.text}</span>
            <span class="circle">﴿${index + 1}﴾</span>
        `
    });
    localStorage.setItem('currentAhya', ayahText.innerHTML);
}

// add date of suwras
async function getDates() {
    let emptyArray = [];
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=cairo&country=egypt&method=8`);
        const data = await res.json();
        let dataTime = data.data.timings;
        emptyArray.push(dataTime);
        emptyArray.forEach((timings) =>{
            Object.keys(timings).forEach(key =>{
                let moad = document.querySelector('.moaqet');
                moad.innerHTML += `
                    <div class="moad">
                        <div class="right">
                            <span class="name">${key}</span>
                        </div>
                        <div class="left">
                            <span>${timings[key]}</span>
                        </div>
                    </div> 
                `
            })
        })
}
getDates();

// get azkar to the page
async function getAzkar() {
    const res = await fetch('https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json');
    const data = await res.json();
    let AzkarSabah =  data['أذكار الصباح'];
    let AzkarMasaa =  data['أذكار المساء'];
    let adaya = data['تسابيح'];
    AzkarSabah.forEach((zkr, index) => {
        if (index === 0) return;
        if (index === 12) return;
        let content = zkr.content;
        let chooseAzkar = document.querySelector('.info_content');
        chooseAzkar.innerHTML += `
        <div class="zkr">
            <div class="right">
            <div class="zkr_num">
                <span class="num">${index}</span>
            </div>
            <span class="name some-ar">${content}</span>
            </div>
        </div> 
        `
    });
    AzkarMasaa.forEach((zkr, index) =>{
        let content = zkr.content;
        let chooseAzkar = document.querySelector('.zkr_content');
        chooseAzkar.innerHTML += `
        <div class="zkr">
            <div class="right">
            <div class="zkr_num">
                <span class="num">${index + 1}</span>
            </div>
            <span class="name some-ar">${content}</span>
            </div>
        </div> 
        `
    });
    adaya.forEach((doaa, index) => {
        let content = doaa.content;
        let chooseDoaa = document.querySelector('.zkr_doaa');
        chooseDoaa.innerHTML += `
        <div class="zkr">
            <div class="right">
            <div class="zkr_num">
                <span class="num">${index + 1}</span>
            </div>
            <span class="name some-ar">${content}</span>
            </div>
        </div> 
        `
    });
}
getAzkar();

// get the current year 
const currentYear = new Date().getFullYear();
document.getElementById('currentYear').textContent = currentYear;

// scroll down
document.querySelector('.down').addEventListener('click', () => {
    const sectionOffset = document.querySelector('.date').offsetTop;
    window.scrollTo({
        top: sectionOffset - 750,
        behavior: 'smooth'
    });
});

// when click on gear settings the changeRiceters class open
let gearSettings = document.querySelector('.settings');
let x_close = document.querySelector('.x_close');

// open the class right of the change_reciters
gearSettings.addEventListener('click', () => {

    document.querySelector('.adds').classList.add('overlay-active')
    document.querySelector('.change_reciters').classList.add('right');
});

// remove the class right of the change_reciters
x_close.addEventListener('click', () =>{
    document.querySelector('.adds').classList.remove('overlay-active')
    removeRight();
} );
// Function to stop scrolling
function stopScrolling() {
    document.body.classList.add('no-scroll');
}

// Function to allow scrolling
function allowScrolling() {
    document.body.classList.remove('no-scroll');
}
document.querySelector('.settings').addEventListener('click', stopScrolling);
// remove the class right of change_reciters when click on the adds element
document.querySelector('.adds').addEventListener('click', (e) =>{
    if (e.target.classList.contains('overlay-active')){
        e.target.classList.remove('overlay-active');
        removeRight();
        allowScrolling();
        checkWarning();
        if (e.target.classList.contains('x_close')){
        }
    } if (e.target.classList.contains('overlay-active2')){
        e.target.classList.remove('display');
        let add = document.querySelector('.show_tafasel');
        if (add){
            add.classList.remove('add');
        }
    }
    if (e.target.classList.contains('x_close')){
        allowScrolling();
        checkWarning();
    }
})

// when click on x remove the parentelement and the overlay
document.querySelector('.show_tafasel').addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-x')){
        document.querySelector('.overlay-active2').classList.remove('display');
        let add = document.querySelector('.show_tafasel');
        if (add){
            add.classList.remove('add');
        }
    }
});

// remove the class right of change_reciters
function removeRight(){
    document.querySelector('.change_reciters').classList.remove('right');
}

// add tafasel surah when click on the tafasle
function saveContent(){
    let content = document.querySelector('.show_tafasel');
    document.querySelector('.tafasel').addEventListener('click', async () => {
        document.querySelector('.overlay-active2').classList.add('display');
        // add class add to the show_tafasel
        setTimeout(() => {
            content.classList.add('add');
        }, 0);
        // fetch api of surahs to show details in tafasle
        try{
            if (currentIndex >= 0){
                const res = await fetch(`https://api.alquran.cloud/v1/surah/${currentIndex + 1}`);
                const data = await res.json();
                let name = data.data.name;
                let ayaht_num = data.data.ayahs.length;
                content.innerHTML = `
                    <div class='start'>
                        <div class='tafsel'>
                            <span some-ar>تفاصيل السورة <i class="fa-solid fa-circle-info"></i></span>
                            <i class="fa-solid fa-x false"></i>
                        </div>
                        <div class='title_tafsel'>
                            <div class='name'>
                                <span  some-ar> اسم السورة:</span>
                                <span> ${name}</span>
                            </div>
                            <div class='num'>
                                <span class='some-ar'> رقم السورة:</span>
                                <span> ${currentIndex + 1}</span>
                            </div>
                        </div>
                        <div class='ayaht'> 
    
                            <div class='where_it'>
                                <span class='some-ar'> مكان النزول:</span>
                                <span> ${data.data.revelationType}</span>
                            </div>
                                <div class='ayaht_num'>
                                <span  some-ar> عدد الآيـــات:</span>
                                <span> ${ayaht_num}</span>
                            </div>
                        </div>
                    </div>
                `;
                localStorage.setItem('innerhtml', content.innerHTML);
                }
        }catch (error) {
            console.error('Error fetching data:', error);
        }
    });
}
saveContent()
// toggle class active to all links
function classActive(){
    let allLinks = document.querySelectorAll('.links li a');
    allLinks.forEach((link) => {
        link.addEventListener('click', (e) =>{
            allLinks.forEach(el => el.classList.remove('active'));
            e.currentTarget.classList.add('active');
        })
    })
}
classActive();


// change size of ahyas
function changeSize(){
    let text_ayah = document.querySelector('.ayah_text');
    let num = document.querySelector('.text_size  .used');
    let input = document.querySelector('.content_size input');
    let update = document.querySelector('.content_size .update');

    update.addEventListener('click', () => {
        if (input.value > 17 && input.value <= 60){
            text_ayah.style.fontSize = `${input.value}px`;
            num.innerHTML = `${input.value}px`;
            document.querySelector('.adds').classList.remove('overlay-active');
            document.querySelector('.change_reciters').classList.remove('right');
            localStorage.setItem('changeSize', `${input.value}px`);
            document.body.classList.remove('no-scroll');
            input.value = '';
        } else{
            document.querySelector('.warning').classList.add('top');
            document.querySelector('.change_size').classList.add('new_update');
            input.value = '';
        }
    })
}
changeSize();
// remove calss top from warning div
function removeClasses(){
    document.querySelector('.ok').addEventListener('click', () => {
        document.querySelector('.warning').classList.remove('top');
        document.querySelector('.change_size').classList.remove('new_update');
    })
}
removeClasses();

// check warning
function checkWarning(){
    let warning = document.querySelector('.warning')
    if (warning.classList.contains('top')){
        warning.classList.remove('top');
        document.querySelector('.change_size').classList.remove('new_update');
    }
}

// when click on the arrowr up
document.querySelector('.footer .up').addEventListener('click', () => {
    scrollTo({
        top: 0,
        behavior: "smooth"
    })
});

// when click on list to add the navBar
let listIcon = document.querySelector('.list');
let linksNav = document.querySelector('.links');

listIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    linksNav.classList.toggle('goUp');
});

document.addEventListener('click', (event) => {
    if (!listIcon.contains(event.target) && !linksNav.contains(event.target)) {
        linksNav.classList.remove('goUp');
    }
});

// save elemnt to localstorage
window.addEventListener('DOMContentLoaded', () =>{
    let saveTitle = localStorage.getItem('currentTitle');
    if (saveTitle){
        let titleSurah = document.querySelector('.adds .title');
        titleSurah.innerHTML = saveTitle;
    }
    // save ahya_text in localstorage
    let saveAyha = localStorage.getItem('currentAhya');
    if (saveAyha){
        let ahya_text = document.querySelector('.ayah_text');
        ahya_text.innerHTML = saveAyha;
    }
    // get local item and check if is true or not
    if (localStorage.getItem('addPage') == 'true'){
        removeHidePage();
    }
    // save tafasel details in localstorage
    let getContent = localStorage.getItem('innerhtml');
    if (getContent){
        document.querySelector('.show_tafasel').innerHTML = getContent;
    }
    // save value of option in localstorage
    let saveValue = localStorage.getItem('saveValue');
    if (saveValue){
        const selectorOptions = document.querySelectorAll('.selector option');
        selectorOptions.forEach(option => {
            if (option.dataset.index == '51'){
                option.value = saveValue;
            }
        })
    }
    // preload and header effect
    setTimeout(() => {
    document.querySelector('.preload').style.display = 'none';
    document.querySelector('.all').style.display = 'block';
    }, 2000);

    // change size of ahyas
    let changeSize = localStorage.getItem('changeSize');
    let text_ayah = document.querySelector('.ayah_text');
    let num = document.querySelector('.text_size  .used');
    if (changeSize){
        text_ayah.style.fontSize = changeSize;
        num.innerHTML = changeSize;
    }

})
