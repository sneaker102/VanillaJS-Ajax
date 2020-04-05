// HTML elements
const searchInputHtml = document.getElementById('search');
const clearSearchHtml = document.getElementById('clear-search');
const createNoteWithImgHtml = document.getElementById('create-note-with-image');
const createNoteInputHtml = document.getElementById('create-note-input');
const pinNoteHtml = document.getElementById('pin-note');
const bodyContentHtml = document.getElementById('body-content');
const noteTextHtml = document.getElementById('note-text');
const cardMainContentHtml = document.getElementById('card-main-content');
const createNoteArticleHtml = document.getElementById('create-note-article');
const userImgContainerHtml = document.getElementById('user-img-container');
const secondUploadImgHtml = document.getElementById('second-upload-img');
const chooseColorHtml = document.getElementById('choose-color');

//api URl
const apiUrl = 'http://localhost:3000/notes';
// search event
const search$ = Rx.Observable.fromEvent(searchInputHtml, 'keyup')
    .debounceTime(500)
    .map(e => toggleClearInput(e))
    .distinctUntilChanged();

search$.subscribe(searchValue => {
    fetch(apiUrl + '?title_like=' + searchValue)
        .then(res => res.json())
        .then(console.log);
});

// clear search text event
clearSearchHtml.addEventListener('click', clearInputValue);

//create full note
createNoteArticleHtml.addEventListener('click', buildFullNoteCard);

//restore initial note card or submit
pinNoteHtml.addEventListener('click', submitNote)

//upload imgs events
createNoteWithImgHtml.addEventListener('click', openFileDialog);
secondUploadImgHtml.addEventListener('click', openFileDialog);

//choose color event
chooseColorHtml.addEventListener('mouseenter', chooseColor);

//textarea resize event
noteTextHtml.addEventListener('input', resizeTextarea);

//on image container hover
userImgContainerHtml.addEventListener('mouseenter', () =>
    document.getElementById('remove-img').style.cssText = 'display:inline-block !important');
userImgContainerHtml.addEventListener('mouseleave', () =>
    document.getElementById('remove-img').style.cssText = 'display:none !important');

//clean up onDestroy
window.addEventListener('beforeunload', clearEvents);

function submitNote(e) {
    if (e.srcElement.id === 'body-content' || e.srcElement.id === 'pin-note') {


        const noteTitle = createNoteInputHtml.value;
        const noteDesc = noteTextHtml.value;
        if (noteTitle.length && noteDesc.length) {
            const noteColor = getStyle(createNoteArticleHtml, 'backgroundColor');
            let noteImg = '';
            const userImgContainerChildsNr = userImgContainerHtml.childNodes.length;
            if (userImgContainerChildsNr > 1) {
                const myImgHtml = userImgContainerHtml.childNodes[userImgContainerChildsNr - 2];
                if (myImgHtml.tagName === 'IMG') {
                    noteImg = myImgHtml.src;
                }
            }
            const myNote = {
                title: noteTitle,
                description: noteDesc,
                color: noteColor,
                img: noteImg
            };
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(myNote)
            })
                .then(res => res.json())
                .then(console.log);
        } else {
            buildCreateNoteCard(e);
        }
    }
}
function chooseColor() {
    if (!chooseColorHtml.childNodes.length) {
        // create colors container
        const colorContainerHtml = document.createElement('div');
        colorContainerHtml.style.display = 'flex';
        colorContainerHtml.style.justifyContent = 'space-around';
        colorContainerHtml.style.position = 'absolute';
        colorContainerHtml.style.width = '9rem';
        colorContainerHtml.style.height = '9rem';
        colorContainerHtml.style.borderRadius = '.4rem';
        colorContainerHtml.style.backgroundColor = '#DCDCDC';
        colorContainerHtml.style.boxShadow = '0 .25rem .25rem rgba(0,0,0,0.2), 0 0 1rem rgba(0,0,0,0.2)';
        // create check mark
        const checkMark = document.createElement('span');
        checkMark.className = 'check-mark';
        // create every color as span
        const myColors = ['rgb(236, 240, 241)', 'rgb(255, 63, 52)', 'rgb(255, 121, 63)',
            'rgb(255, 242, 0)', 'rgb(58, 227, 116)', 'rgb(126, 255, 245)',
            'rgb(125, 95, 255)', 'rgb(179, 55, 113)', 'rgb(202, 211, 200)'];
        const allColorSpan = [];
        myColors.forEach((color, i) => {
            const colorSpanHtml = document.createElement('span');
            colorSpanHtml.style.backgroundColor = color;
            let className = 'circle';
            if (getStyle(createNoteArticleHtml, 'backgroundColor') === color) {
                className += ' selected';
                colorSpanHtml.appendChild(checkMark);
            }
            colorSpanHtml.className = className;
            // align row of 3 colors
            if (i % 3 === 0) {
                const rowDiv = document.createElement('div');
                rowDiv.appendChild(colorSpanHtml);
                colorContainerHtml.appendChild(rowDiv);
            } else {
                colorContainerHtml.childNodes[colorContainerHtml.childNodes.length - 1].appendChild(colorSpanHtml);
            }
            allColorSpan.push(colorSpanHtml);
            colorSpanHtml.addEventListener('click', selectColor.bind(null, createNoteArticleHtml, colorSpanHtml, allColorSpan, event));
        });
        chooseColorHtml.appendChild(colorContainerHtml);
        colorContainerHtml.addEventListener('mouseleave', () => chooseColorHtml.removeChild(colorContainerHtml));
    }
}
function selectColor(elToColor, elToMark, allElColors, e) {
    e.stopPropagation();
    elToColor.style.backgroundColor = elToMark.style.backgroundColor;
    elToMark.className += ' selected';
    for (elColor of allElColors) {
        const childsNr = elColor.childNodes.length;
        if (childsNr) {
            elColor.className = 'circle';
            const myMark = elColor.childNodes[childsNr - 1];
            elToMark.appendChild(myMark);
            break;
        }
    }
}
function removeImg() {
    const userImgHtml = userImgContainerHtml.childNodes[userImgContainerHtml.childNodes.length - 2];
    if (!!userImgHtml && userImgHtml.tagName === 'IMG') {
        userImgContainerHtml.removeChild(userImgHtml);
        userImgContainerHtml.style.display = 'none';
        createNoteInputHtml.focus();
    }
}
function openFileDialog(e) {
    e.stopPropagation();
    const fileInputHtml = document.createElement('input');
    fileInputHtml.type = 'file';
    fileInputHtml.accept = 'image/*';
    fileInputHtml.multiple = false;
    fileInputHtml.addEventListener('change', fileDialogChanged);
    fileInputHtml.dispatchEvent(new MouseEvent('click'));
}

function fileDialogChanged(e) {
    if (e.target.files && e.target.files[0]) {
        const fileName = e.target.files[0].name;
        const reader = new FileReader();
        reader.onload = function (fileLoadEvent) {
            const previousImgHtml = document.getElementById('user-img-upload');
            if (!!!previousImgHtml) {
                const imgHtml = document.createElement('img');
                imgHtml.id = 'user-img-upload';
                imgHtml.src = fileLoadEvent.target.result;
                imgHtml.alt = fileName;
                imgHtml.name = fileName;
                imgHtml.style.maxHeight = '45rem';
                imgHtml.style.maxWidth = '45rem';
                //img container
                userImgContainerHtml.style.display = 'flex';
                const dummyHtml = document.createElement('div');
                dummyHtml.innerHTML = '<i id="remove-img" class="far fa-trash-alt remove-img"></i>'
                userImgContainerHtml.appendChild(imgHtml);
                userImgContainerHtml.appendChild(dummyHtml.firstChild);
                //on remove img 
                userImgContainerHtml.childNodes[userImgContainerHtml.childNodes.length - 1].addEventListener('click', removeImg);
            } else {
                previousImgHtml.src = fileLoadEvent.target.result;
            }
            if (cardMainContentHtml.style.display === ''
                || cardMainContentHtml.style.display === 'none') {
                buildFullNoteCard(e)
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
}

function buildCreateNoteCard(e) {
    if (e.srcElement.id === 'body-content' || e.srcElement.id === 'pin-note'
        || e.srcElement.id === 'close-note') {
        e.stopPropagation();
        removeImg();
        noteTextHtml.value = '';
        cardMainContentHtml.style.display = 'none';
        createNoteInputHtml.value = '';
        createNoteInputHtml.placeholder = 'Create a note...';
        createNoteWithImgHtml.style.display = 'inline-block';
        pinNoteHtml.style.cssText = 'display:none !important';
        bodyContentHtml.removeEventListener('click', submitNote);
        createNoteArticleHtml.addEventListener('click', buildFullNoteCard);
    }
}

function buildFullNoteCard(e) {
    if ((!!e && !!e.srcElement && e.srcElement.id !== 'create-note-with-image')
        || (!!e && !!!e.srcElement)) {
        e.stopPropagation();
        createNoteInputHtml.placeholder = 'Title';
        createNoteWithImgHtml.style.display = 'none';
        pinNoteHtml.style.cssText = 'display:inline-block !important';
        cardMainContentHtml.style.display = 'block';
        createNoteInputHtml.focus();
        createNoteArticleHtml.removeEventListener('click', buildFullNoteCard);
        bodyContentHtml.addEventListener('click', submitNote);
    }
}

function toggleClearInput(e) {
    if (e.target.value.length) {
        clearSearchHtml.style.display = 'inline-block';
    } else {
        clearSearchHtml.style.display = 'none';
    }
    return e.target.value;
}

function clearInputValue() {
    searchInputHtml.value = '';
    clearSearchHtml.style.display = 'none';
    searchInputHtml.focus();
}

function resizeTextarea() {
    window.setTimeout(() => {
        noteTextHtml.style.height = 'auto';
        noteTextHtml.style.height = (noteTextHtml.scrollHeight) + 'px';
    }, 0);
}

function getStyle(el, styleProp) {
    if (el.currentStyle)
        return el.currentStyle[styleProp];

    return document.defaultView.getComputedStyle(el, null)[styleProp];
}
function clearAllEventListeners(el) {
    const bodyContentClone = el.cloneNode(true);
    el.parentNode.replaceChild(bodyContentClone, el);
}
function clearEvents() {
    search$.unsubscribe();
    clearAllEventListeners(bodyContentHtml);
}