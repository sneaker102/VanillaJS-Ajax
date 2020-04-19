class AbstractNote {
    constructor(cardContainer) {
        if (this.constructor === AbstractNote) {
            throw new Error('Abstract classes can not be instantiated.')
        }
        this.cardContainer = cardContainer;
    }
    get hasImage() {
        return this.cardContainer.childElementCount === 4;
    }
    get titleInput() {
        if (this.hasImage) {
            return this.cardContainer.children[2].children[0].children[0];
        }
        return this.cardContainer.children[0].children[0].children[0];
    }
    get pinNoteIcon() {
        if (this.hasImage) {
            return this.cardContainer.children[2].children[0].children[1];
        }
        return this.cardContainer.children[0].children[0].children[1];
    }
    get uploadImgIcon() {
        if (this.hasImage) {
            return this.cardContainer.children[3].children[0].children[1];
        }
        return this.cardContainer.children[1].children[0].children[1];
    }
    get paletteIcon() {
        if (this.hasImage) {
            return this.cardContainer.children[3].children[0].children[0];
        }
        return this.cardContainer.children[1].children[0].children[0];
    }
    get descriptionTextarea() {
        if (this.hasImage) {
            return this.cardContainer.children[2].children[1];
        }
        return this.cardContainer.children[0].children[1];
    }
    get cardFooter() {
        if (this.hasImage) {
            return this.cardContainer.children[3];
        }
        return this.cardContainer.children[1];
    }
    get uploadedImg() {
        if (this.hasImage) {
            return this.cardContainer.children[1].children[0];
        }
        return undefined;
    }
    get closeBtn() {
        if (this.hasImage) {
            return this.cardContainer.children[3].children[1];;
        }
        return this.cardContainer.children[1].children[1];
    }
    afterImageCreated(img) {
        // to be overrided by the class in need
    }
    openFileDialog(e) {
        if (!!e) {
            e.stopPropagation();
        }
        const fileInputHtml = document.createElement('input');
        fileInputHtml.type = 'file';
        fileInputHtml.accept = 'image/*';
        fileInputHtml.multiple = false;
        fileInputHtml.addEventListener('change', this.fileDialogChanged.bind(this));
        fileInputHtml.dispatchEvent(new MouseEvent('click'));
    }
    fileDialogChanged(e) {
        if (e.target.files && e.target.files[0]) {
            const afterImageCreated = this.afterImageCreated.bind(this);
            const putImgOnCard = this.putImgOnCard.bind(this);
            const reader = new FileReader();
            reader.onload = function (fileLoadEvent) {
                putImgOnCard(fileLoadEvent.target.result);
                afterImageCreated(fileLoadEvent.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    putImgOnCard(img) {
        if (!this.hasImage) {
            const uploadedImgContainer = document.createElement('aside');
            uploadedImgContainer.className = 'user-img-container';
            uploadedImgContainer.style.display = 'flex';

            const imgHtml = document.createElement('img');
            imgHtml.src = img;
            imgHtml.style.maxHeight = '36.4rem';
            imgHtml.style.maxWidth = '36.4rem';

            uploadedImgContainer.appendChild(imgHtml);

            const dummyHtml = document.createElement('div');
            dummyHtml.innerHTML = '<i class="far fa-trash-alt remove-img"></i>'

            this.cardContainer.insertBefore(uploadedImgContainer, this.cardContainer.children[0]);
            this.cardContainer.insertBefore(dummyHtml.firstChild, this.cardContainer.children[0]);
            //on remove img 
            this.cardContainer.children[0].addEventListener('click', this.removeImg.bind(this));
            //on image container hover
            this.cardContainer.addEventListener('mouseenter', this.setOpacity.bind(this, this.cardContainer.children[0], 1));
            this.cardContainer.addEventListener('mouseleave', this.setOpacity.bind(this, this.cardContainer.children[0], 0));
        } else {
            this.uploadedImg.src = img;
        }
    }
    removeImg() {
        if (this.hasImage) {
            this.cardContainer.removeChild(this.cardContainer.children[0]);
            this.cardContainer.removeChild(this.cardContainer.children[0]);
            this.cardContainer.removeEventListener('mouseenter', this.setOpacity);
            this.cardContainer.removeEventListener('mouseleave', this.setOpacity);
        }
    }
    setOpacity(el, opacity) {
        el.style.opacity = opacity;
    }
    chooseColor() {
        if (!this.paletteIcon.childNodes.length) {
            // create colors container
            const colorsContainerHtml = document.createElement('div');
            colorsContainerHtml.style.display = 'flex';
            colorsContainerHtml.style.justifyContent = 'space-around';
            colorsContainerHtml.style.position = 'absolute';
            colorsContainerHtml.style.width = '9rem';
            colorsContainerHtml.style.height = '9rem';
            colorsContainerHtml.style.borderRadius = '.4rem';
            colorsContainerHtml.style.backgroundColor = '#DCDCDC';
            colorsContainerHtml.style.boxShadow = '0 .25rem .25rem rgba(0,0,0,0.2), 0 0 1rem rgba(0,0,0,0.2)';
            // create check mark
            const checkMark = document.createElement('span');
            checkMark.className = 'check-mark';
            // create every color as span
            const myColors = ['rgb(236, 240, 241)', 'rgb(255, 63, 52)', 'rgb(255, 121, 63)',
                'rgb(255, 242, 0)', 'rgb(58, 227, 116)', 'rgb(126, 255, 245)',
                'rgb(125, 95, 255)', 'rgb(179, 55, 113)', 'rgb(202, 211, 200)'];
            const allColorsSpanArr = [];
            myColors.forEach((color, i) => {
                const colorSpanHtml = document.createElement('span');
                colorSpanHtml.style.backgroundColor = color;
                let className = 'circle';
                if (this.getStyle(this.cardContainer, 'backgroundColor') === color) {
                    className += ' selected';
                    colorSpanHtml.appendChild(checkMark);
                }
                colorSpanHtml.className = className;
                // align row of 3 colors
                if (i % 3 === 0) {
                    const rowDiv = document.createElement('div');
                    rowDiv.appendChild(colorSpanHtml);
                    colorsContainerHtml.appendChild(rowDiv);
                } else {
                    colorsContainerHtml.childNodes[colorsContainerHtml.childNodes.length - 1].appendChild(colorSpanHtml);
                }
                allColorsSpanArr.push(colorSpanHtml);
                colorSpanHtml.addEventListener('click', this.selectColor.bind(this, colorSpanHtml, allColorsSpanArr));
            });
            this.paletteIcon.appendChild(colorsContainerHtml);
            colorsContainerHtml.addEventListener('mouseleave', () => this.paletteIcon.removeChild(colorsContainerHtml));
        }
    }
    selectColor(elToMark, allElColors, e) {
        if (!!e) {
            e.stopPropagation();
        }
        // set the color to the card container
        this.cardContainer.style.backgroundColor = elToMark.style.backgroundColor;
        // get rid of the last selected color mark and circle
        // and update the selected color
        elToMark.className += ' selected';
        for (const elColor of allElColors) {
            if (elColor.childElementCount) {
                elColor.className = 'circle';
                const myMark = elColor.childNodes[elColor.childElementCount - 1];
                elToMark.appendChild(myMark);
                break;
            }
        }
    }
    resizeTextarea() {
        window.setTimeout(() => {
            this.descriptionTextarea.style.height = 'auto';
            this.descriptionTextarea.style.height = (this.descriptionTextarea.scrollHeight) + 'px';
        }, 0);
    }
    getStyle(el, styleProp) {
        if (el.currentStyle)
            return el.currentStyle[styleProp];

        return document.defaultView.getComputedStyle(el, null)[styleProp];
    }
}

class CreateNote extends AbstractNote {
    constructor(cardContainer, submitUrl, reloadDataFn) {
        super(cardContainer);
        this.submitUrl = submitUrl;
        this.createNoteByImgIcon = document.getElementById('create-note-with-image');
        this.reloadDataFn = reloadDataFn;
        //create full note
        this.cardContainer.addEventListener('click', this.buildFullCard.bind(this));

        //restore initial note card or submit
        this.submitSub = Rx.Observable
            .merge(...[
                Rx.Observable.fromEvent(this.pinNoteIcon, 'click'),
                Rx.Observable.fromEvent(window, 'click')])
            .throttleTime(300).subscribe(e => this.submitNote(e));

        //upload imgs events
        this.createNoteByImgIcon.addEventListener('click', this.openFileDialog.bind(this));
        this.uploadImgIcon.addEventListener('click', this.openFileDialog.bind(this));

        //choose color event
        this.paletteIcon.addEventListener('mouseenter', this.chooseColor.bind(this));

        // resize textarea when full
        this.descriptionTextarea.addEventListener('input', this.resizeTextarea.bind(this));
    }
    get isCardFull() {
        return this.descriptionTextarea.style.display === 'block';
    }
    get pinNoteIcon() {
        if (this.hasImage) {
            return this.cardContainer.children[2].children[0].children[2];
        }
        return this.cardContainer.children[0].children[0].children[2];
    }
    buildFullCard(e) {
        if (!!e && (!this.isCardFull && (!!!e.srcElement || e.srcElement.id !== 'create-note-with-image'))) {
            e.stopPropagation();
            this.titleInput.placeholder = 'Title';
            this.titleInput.focus();
            this.createNoteByImgIcon.style.display = 'none';
            this.pinNoteIcon.style.cssText = 'display:inline-block !important';
            this.descriptionTextarea.style.cssText = 'display:block !important';
            this.cardFooter.style.cssText = 'display:flex !important';
        }
    }
    submitNote(e) {
        if (e.srcElement.tagName.toLowerCase() === 'body' || e.srcElement.id === 'pin-note') {

            if (this.titleInput.value.length && this.descriptionTextarea.value.length) {

                const myNote = {
                    title: this.titleInput.value,
                    description: this.descriptionTextarea.value,
                    color: this.getStyle(this.cardContainer, 'backgroundColor'),
                    img: !!this.uploadedImg ? this.uploadedImg.src : ''
                };

                fetch(this.submitUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(myNote)
                })
                    .then(_ => {
                        this.reloadDataFn('');
                        this.buildSmallCard(e);
                    });

            } else {
                this.buildSmallCard(e);
            }
        }
    }
    buildSmallCard(e) {
        if (!!e && (e.srcElement.tagName.toLowerCase() === 'body' || e.srcElement.id === 'pin-note' || e.srcElement.id === 'close-note')) {
            e.stopPropagation();

            this.cardContainer.style.backgroundColor = 'rgb(236, 240, 241)';

            // remove img if exists
            this.removeImg();

            this.descriptionTextarea.value = '';
            this.descriptionTextarea.style.cssText = 'display:none !important';

            this.cardFooter.style.cssText = 'display:none !important';

            this.titleInput.value = '';
            this.titleInput.placeholder = 'Create a note...';

            this.createNoteByImgIcon.style.display = 'inline-block';

            this.pinNoteIcon.style.cssText = 'display:none !important';

            this.cardContainer.addEventListener('click', this.buildFullCard.bind(this));
        }
    }
    fileDialogChanged(e) {
        if (e.target.files && e.target.files[0]) {
            // get the refs for CreateNote object
            const putImgOnCard = this.putImgOnCard.bind(this);
            const isCardFull = this.isCardFull;
            const buildFullCard = this.buildFullCard.bind(this);

            const reader = new FileReader();
            reader.onload = function (fileLoadEvent) {
                putImgOnCard(fileLoadEvent.target.result);
                if (!isCardFull) {
                    buildFullCard(e)
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }
}

class NoteView extends AbstractNote {
    constructor(note, updateUrl, reloadDataFn) {

        const cardLayout = document.createElement('article');

        super(cardLayout);
        this.reloadDataFn = reloadDataFn;
        this.note = note;
        this.updateUrl = updateUrl;

        cardLayout.className = 'create-note created-note';
        cardLayout.style.backgroundColor = note.color;

        const topSection = document.createElement('section');
        const dummyDiv = document.createElement('div');


        const inputTitle = document.createElement('input');
        inputTitle.type = 'text';
        inputTitle.placeholder = 'Title';
        inputTitle.className = 'u-transparent';
        inputTitle.value = note.title;
        // modal event
        inputTitle.addEventListener('click', this.makeModal.bind(this));

        dummyDiv.appendChild(inputTitle);

        const pinImg = document.createElement('i');
        pinImg.className = 'fas fa-thumbtack pin-note';
        pinImg.id = 'pin-note';
        pinImg.addEventListener('click', this.saveNote.bind(this));

        dummyDiv.appendChild(pinImg);

        topSection.appendChild(dummyDiv);

        const textareaDescription = document.createElement('textarea');
        textareaDescription.className = 'u-transparent description-note';
        textareaDescription.placeholder = 'Create a note...';
        textareaDescription.value = note.description;
        // resize textarea when full
        textareaDescription.addEventListener('input', this.resizeTextarea.bind(this));
        // modal event
        textareaDescription.addEventListener('click', this.makeModal.bind(this));

        topSection.appendChild(textareaDescription);
        cardLayout.appendChild(topSection);

        const cardFooter = document.createElement('footer');

        const spanContainer = document.createElement('span');

        const brushIcon = document.createElement('i');
        brushIcon.className = 'fas fa-paint-brush';
        brushIcon.addEventListener('mouseenter', this.chooseColor.bind(this));

        spanContainer.appendChild(brushIcon);

        const uploadImgIcon = document.createElement('i');
        uploadImgIcon.className = 'far fa-image';
        uploadImgIcon.addEventListener('click', this.openFileDialog.bind(this));

        spanContainer.appendChild(uploadImgIcon);
        cardFooter.appendChild(spanContainer);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'u-transparent u-display-none';
        closeBtn.innerText = 'Delete';

        cardFooter.appendChild(closeBtn);
        cardLayout.appendChild(cardFooter);

        if (note.img.length) {
            this.putImgOnCard(note.img);
        }

        document.getElementById('created-note-container').appendChild(cardLayout);

    }
    makeModal() {
        if (!!!document.getElementById('my-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'my-modal';

            this.pinNoteIcon.style.cssText = 'display:inline-block !important';

            this.closeBtn.style.cssText = 'display:block !important';
            this.closeBtn.id = 'delete-btn'
            this.closeBtn.addEventListener('click', this.removeModal.bind(this))

            modal.appendChild(this.cardContainer);
            modal.addEventListener('click', this.removeModal.bind(this));
            document.getElementById('created-note-container').appendChild(modal);
        }
    }
    removeModal(e) {
        const modalDiv = document.getElementById('my-modal');
        if (!!modalDiv &&
            (e.target.id === 'my-modal' || e.target.id === 'delete-btn' || e.target.id === 'pin-note')) {
            const createdNotesContainer = document.getElementById('created-note-container');
            this.closeBtn.style.cssText = 'display:none !important';
            this.pinNoteIcon.style.cssText = 'display:none !important';
            // if it is not the save or delete clicked then we restore data in note
            if (e.target.id === 'my-modal') {
                this.titleInput.value = this.note.title;
                this.descriptionTextarea.value = this.note.description;
                this.cardContainer.style.backgroundColor = this.note.color;
                if (!!this.uploadedImg && this.note.img.length) {
                    this.uploadedImg.src = this.note.img;
                } else {
                    this.removeImg();
                }
                // do not insert back the note if save or delete was clicked
                // because a data refresh will be triggered
                createdNotesContainer.insertBefore(modalDiv.firstChild, createdNotesContainer.firstChild);
            }
            if (e.target.id === 'delete-btn') {
                this.deleteNote();
            }
            createdNotesContainer.removeChild(modalDiv);
        }
    }
    updateNote() {
        fetch(this.updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.note)
        })
            .then(_ => this.reloadDataFn(''));
    }
    selectColor(elToMark, allElColors, e) {
        super.selectColor(elToMark, allElColors, e);
        // we want to update only when not in modal
        // caz in modal mode we have pin-note icon for save
        if (!!!document.getElementById('my-modal') && elToMark.style.backgroundColor !== this.note.color) {
            this.note.color = elToMark.style.backgroundColor;
            this.updateNote();
        }
    }
    afterImageCreated(img) {
        // we want to update only when not in modal
        // caz in modal mode we have pin-note icon for save
        if (!!!document.getElementById('my-modal') && img !== this.note.img) {
            this.note.img = img;
            this.updateNote();
        }
    }
    removeImg() {
        super.removeImg();
        // we want to update only when not in modal
        // caz in modal mode we have pin-note icon for save
        if (!!!document.getElementById('my-modal')) {
            this.note.img = '';
            this.updateNote();
        }
    }
    saveNote(e) {
        if (this.titleInput.value !== this.note.title ||
            this.descriptionTextarea.value !== this.note.description ||
            !!this.uploadedImg && this.uploadedImg.src !== this.note.img ||
            this.getStyle(this.cardContainer, 'backgroundColor') !== this.note.color) {
            this.note.title = this.titleInput.value;
            this.note.description = this.descriptionTextarea.value;
            this.note.color = this.getStyle(this.cardContainer, 'backgroundColor');
            if (!!this.uploadedImg) {
                this.note.img = this.uploadedImg.src;
            } else {
                this.note.img = '';
            }
            this.updateNote();
            this.removeModal(e);
        }
    }
    deleteNote() {
        fetch(this.updateUrl, {
            method: 'DELETE'
        })
            .then(_ => this.reloadDataFn(''));
    }
}
//api URl
const apiUrl = 'http://localhost:3000/notes';
let noteDataArr;

// search notes
const searchNote = {
    input: this.document.getElementById('search-input'),
    searchSub: null,
    apiSearch: (value) => {
        fetch(apiUrl + '?title_like=' + value)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // remember data in order to check for updates
                    noteDataArr = data;
                    // clear previous data
                    document.getElementById('created-note-container').innerHTML = '';

                    data.forEach(note => {
                        const myNoteView = new NoteView(note, apiUrl + '/' + note.id, searchNote.apiSearch);
                    });
                }
            });
    },
    initEvents: () => {
        if (searchNote.searchSub === null) {
            // search event
            searchNote.searchSub = Rx.Observable.fromEvent(searchNote.input, 'keyup')
                .debounceTime(500)
                .map(e => e.target.value)
                .distinctUntilChanged()
                // toggle clear search img
                .map(value => {
                    if (value.length) {
                        searchNote.input.nextElementSibling.style.display = 'inline-block';
                    } else {
                        searchNote.input.nextElementSibling.style.display = 'none';
                    }
                    return value;
                })
                .subscribe(searchValue => searchNote.apiSearch(searchValue));
            // clear search event
            searchNote.input.nextElementSibling.addEventListener('click', () => {
                searchNote.input.value = '';
                searchNote.input.dispatchEvent(new Event('keyup'));
            });

            // get all saved notes
            searchNote.apiSearch('');
        }
    }
};

const createNote = new CreateNote(document.getElementById('create-note-card'), apiUrl, searchNote.apiSearch);

searchNote.initEvents();

this.window.addEventListener('beforeunload', this.clearAllEvents);


function clearAllElementEventListenersTree(el) {
    const elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
}
function clearAllEvents() {
    if (!!searchNote.searchSub) {
        searchNote.searchSub.unsubscribe();
    }
    if (!!createNote.submitSub) {
        createNote.submitSub.unsubscribe();
    }
    this.clearAllElementEventListenersTree(this.document.body);
}