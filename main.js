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
const secondUploadImgHtml = document.getElementById('second-upload-img');
const chooseColorHtml = document.getElementById('choose-color');

// view data
const viewNotes = [];
//api URl
const apiUrl = 'http://localhost:3000/notes';
// on init
(function () {
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(resp => resp.json())
        .then(data => createViewNotes(data));
})();

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
const submitEvents$ = Rx.Observable
    .merge(...[
        Rx.Observable.fromEvent(pinNoteHtml, 'click'),
        Rx.Observable.fromEvent(bodyContentHtml, 'click')])
    .throttleTime(300).subscribe(e => submitNote(e));
//upload imgs events
createNoteWithImgHtml.addEventListener('click', newNoteUploadFile);
secondUploadImgHtml.addEventListener('click', newNoteUploadFile);

//choose color event
chooseColorHtml.addEventListener('mouseenter', chooseColor.bind(this, chooseColorHtml, createNoteArticleHtml));

//textarea resize event
noteTextHtml.addEventListener('input', resizeTextarea);


//clean up onDestroy
window.addEventListener('beforeunload', clearEvents);

function createViewNotes(data) {
    if (Array.isArray(data)) {
        data.forEach(note => {
            const cardLayout = document.createElement('article');
            cardLayout.className = 'create-note created-note';
            cardLayout.style.backgroundColor = note.color;
            const uploadedImgContainer = document.createElement('aside');
            uploadedImgContainer.className = 'user-img-container';
            if (note.img.length) {
                const imgHtml = document.createElement('img');
                imgHtml.src = note.img;
                imgHtml.style.maxHeight = '36.4rem';
                imgHtml.style.maxWidth = '36.4rem';
                //img container
                uploadedImgContainer.style.display = 'flex';
                const dummyHtml = document.createElement('div');
                dummyHtml.innerHTML = '<i class="far fa-trash-alt remove-img"></i>'
                uploadedImgContainer.appendChild(imgHtml);
                uploadedImgContainer.appendChild(dummyHtml.firstChild);
                //on remove img 
                uploadedImgContainer.childNodes[1].addEventListener('click', () => uploadedImgContainer.parentNode.removeChild(uploadedImgContainer));
                //on image container hover
                uploadedImgContainer.addEventListener('mouseenter', () =>
                    uploadedImgContainer.childNodes[1].style.cssText = 'display:inline-block !important');
                uploadedImgContainer.addEventListener('mouseleave', () =>
                    uploadedImgContainer.childNodes[1].style.cssText = 'display:none !important');
                cardLayout.appendChild(uploadedImgContainer);
            }
            const headerSection = document.createElement('section');
            const inputTitle = document.createElement('input');
            inputTitle.type = 'text';
            inputTitle.placeholder = 'Title';
            inputTitle.className = 'u-transparent';
            inputTitle.value = note.title;
            headerSection.appendChild(inputTitle);
            const pinImg = document.createElement('i');
            pinImg.className = 'fas fa-thumbtack pin-note';
            headerSection.appendChild(pinImg);
            cardLayout.appendChild(headerSection);
            const mainContentSection = document.createElement('section');
            const textareaDescription = document.createElement('textarea');
            textareaDescription.className = 'u-transparent';
            textareaDescription.placeholder = 'Create a note...';
            textareaDescription.value = note.description;
            mainContentSection.appendChild(textareaDescription);
            const mainContentFooter = document.createElement('footer');
            const spanContainer = document.createElement('span');
            const brushIcon = document.createElement('i');
            brushIcon.className = 'fas fa-paint-brush';
            brushIcon.addEventListener('mouseenter', chooseColor.bind(this, brushIcon, cardLayout, event));
            spanContainer.appendChild(brushIcon);
            const uploadImgIcon = document.createElement('i');
            uploadImgIcon.className = 'far fa-image';
            uploadImgIcon.addEventListener('click', openFileDialog.bind(this, uploadedImgContainer, false))
            spanContainer.appendChild(uploadImgIcon);
            mainContentFooter.appendChild(spanContainer);
            const closeBtn = document.createElement('button');
            closeBtn.className = 'u-transparent';
            closeBtn.innerText = 'Close';
            closeBtn.style.display = 'none';
            mainContentFooter.appendChild(closeBtn);
            mainContentSection.appendChild(mainContentFooter);
            cardLayout.appendChild(mainContentSection);
            if (note.img.length) {
                // const modal = document.createElement('div');
                // modal.className = 'modal';
                // modal.appendChild(cardLayout);
                // document.getElementById('created-note-container').appendChild(modal);
            } else {
            }
            document.getElementById('created-note-container').appendChild(cardLayout);
        });
    }
}
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
                .then(_ => buildCreateNoteCard(e));
        } else {
            buildCreateNoteCard(e);
        }
    }
}
function chooseColor(btn, containerToColor) {
    if (!btn.childNodes.length) {
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
            if (getStyle(containerToColor, 'backgroundColor') === color) {
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
            colorSpanHtml.addEventListener('click', selectColor.bind(this, containerToColor, colorSpanHtml, allColorSpan));
        });
        btn.appendChild(colorContainerHtml);
        colorContainerHtml.addEventListener('mouseleave', () => btn.removeChild(colorContainerHtml));
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
function newNoteUploadFile(e) {
    const imgContainer = document.createElement('aside');
    imgContainer.className = 'user-img-container';
    createNoteArticleHtml.insertBefore(imgContainer, document.getElementById('card-header-section'));
    openFileDialog(imgContainer, true, e);
}
function openFileDialog(imgContainer, isNewNote, e) {
    e.stopPropagation();
    const fileInputHtml = document.createElement('input');
    fileInputHtml.type = 'file';
    fileInputHtml.accept = 'image/*';
    fileInputHtml.multiple = false;
    fileInputHtml.addEventListener('change', fileDialogChanged.bind(this, imgContainer, isNewNote));
    fileInputHtml.dispatchEvent(new MouseEvent('click'));
}

function fileDialogChanged(imgContainer, isNewNote, e) {
    if (e.target.files && e.target.files[0]) {
        const fileName = e.target.files[0].name;
        const reader = new FileReader();
        reader.onload = function (fileLoadEvent) {
            // second child is the actual img
            if (!imgContainer.childNodes.length) {
                const imgHtml = document.createElement('img');
                imgHtml.id = 'user-img-upload';
                imgHtml.src = fileLoadEvent.target.result;
                imgHtml.alt = fileName;
                imgHtml.name = fileName;
                imgHtml.style.maxHeight = '45rem';
                imgHtml.style.maxWidth = '45rem';
                //img container
                imgContainer.style.display = 'flex';
                const dummyHtml = document.createElement('div');
                dummyHtml.innerHTML = '<i class="far fa-trash-alt remove-img"></i>'
                imgContainer.appendChild(imgHtml);
                imgContainer.appendChild(dummyHtml.firstChild);
                //on remove img 
                imgContainer.childNodes[1].addEventListener('click', () => imgContainer.parentNode.removeChild(imgContainer));
                //on image container hover
                imgContainer.addEventListener('mouseenter', () =>
                    imgContainer.childNodes[1].style.cssText = 'display:inline-block !important');
                imgContainer.addEventListener('mouseleave', () =>
                    imgContainer.childNodes[1].style.cssText = 'display:none !important');
            } else {
                imgContainer.childNodes[0].src = fileLoadEvent.target.result;
            }
            if (!!isNewNote && (cardMainContentHtml.style.display === ''
                || cardMainContentHtml.style.display === 'none')) {
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
        // removeImg();
        noteTextHtml.value = '';
        cardMainContentHtml.style.display = 'none';
        createNoteInputHtml.value = '';
        createNoteInputHtml.placeholder = 'Create a note...';
        createNoteWithImgHtml.style.display = 'inline-block';
        pinNoteHtml.style.cssText = 'display:none !important';
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
    submitEvents$.unsubscribe();
    clearAllEventListeners(bodyContentHtml);
}