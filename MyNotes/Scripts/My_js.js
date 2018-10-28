var lastNoteSelect;
var selectedNoteNumber; // номер текущей выбранной заметки
var selectedNoteFavourite; // 1 - избранное, 0 - нет
var selectedNewNoteFavourite = 0;
var curentSearchAttribute = "All"; // признак сортировки All / Favourite
var textSearchString = "";
var sortMethodAttr = 1; // Метод сортировки 1,2,3,4 
var currentFolderId = null; // Id текущей папки
var currentFolderIdForSave;
var currentFolderIdForSave1; // 
var currentFolderName; // Имя текущей папки
var currentFolderName1;
var allNotesSelect = true; // признак выбора всех заметок из всех блокнотов
var folderToDel; // 
var trashId;
var tt;
var trashSelected = false;
var notesNumber;


$(document).ready(function () {
    
    GetCurrentFolder();
    GetTrashId();
    // Выводим список заметок при загрузке страницы
    ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
            
    /////////////////////////////////////////////////////////////////////////
    // Пересохранение заметки после изменения
    $('.note-title').focusout(function () {
        if (notesNumber != 0) {
            ReSave();

            var l = document.getElementsByClassName("notes-list").length;

            for (var i = 0; i < l; i++) {
                var num = document.getElementsByClassName("notes-list")[i].dataset.noteId;
                if (num == selectedNoteNumber) {

                    $.ajax({
                        async: false,
                        type: "POST",
                        data: { noteNumber: num },
                        url: "/Home/GetNoteBody/",
                        success: function (data) {
                            var nnn;
                            $.each(data, function (index, note) { nnn = unescape(note.Title) });
                            var nn = nnn.replace(/\<p>/gi, "");
                            nn = nn.replace(/\<\/p>/gi, " ");
                            nn = nn.replace(/\<br>/gi, " ");
                            nn = nn.replace(/\<div>/gi, " ");
                            nn = nn.replace(/\<\/div>/gi, " ");
                            nn = nn.replace(/\&nbsp;/gi, " ");
                            nn = nn.replace(/\&amp;/gi, "&");
                            document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent = nn;
                        },
                        error: function () { alert(Error); }
                    });
                }
            }
        }
    });
    $('.note-body').focusout(function () {
        if (notesNumber != 0) {
            ReSave();            
        }
    });

    // Включение/отключение возможности редактирования заметки в зависимости от того есть они или нет
    $('.note-title').on("click",function () {
        if (notesNumber == 0) {
            $('.note-title').attr("contenteditable", false);
            $('.note-body').attr("contenteditable", false);
        } else {
            $('.note-title').attr("contenteditable", true);
            $('.note-body').attr("contenteditable", true);
        }
    });
    $('.note-body').on("click", function () {
        if (notesNumber == 0) {
            $('.note-title').attr("contenteditable", false);
            $('.note-body').attr("contenteditable", false);
        } else {
            $('.note-title').attr("contenteditable", true);
            $('.note-body').attr("contenteditable", true);
        }
    });
    
    // Функция вызывается при нажатии на иконку аккаунта и отображается account-window
    $("#account-effect").click(function () {
        $('.mask').show();
        //$('.mask').animate({ opacity: 0.5 });
        $("#account-window").toggle("fade", 400);
        $('.mask').click(function () {
            $('.mask, .delete-window').fadeOut(500);
        });
    });

    // При клике за рамками окна account-window, оно скрывается
    $(document).mouseup(function (e) { // событие клика по веб-документу
        var account_window = $("#account-window"); // тут указываем ID элемента, всплывающее окно account
        var dd = $("#account-effect"); // тут ID элемента <img> по нажатию на которое вызывается окно account-window
        if (!account_window.is(e.target) // если клик был не по нашему блоку
            && !dd.is(e.target)
		    && account_window.has(e.target).length === 0) { // и не по его дочерним элементам
            account_window.hide("fade", 400); // скрываем его
        }
    });
       
    // Подключение и настройка кастомного скрола
    $("#col-note-list-bottom-block").niceScroll({ cursorwidth: "13px", cursoropacitymax: "0.3" });
    //$("#col-note-edit-area").niceScroll({ cursorwidth: "13px", cursoropacitymax: "0.3" });
    
    // Обработка логики подсветки иконки "избранное" при наведении мышкой
    $("#icon-favourite-note").mouseover(function () {
            $("#icon-favourite-note").css("color", "#ff9600");
    }).mouseout(function () {
        if (selectedNoteFavourite == 1) {
            $("#icon-favourite-note").css("color", "#ff9600");
        } else {
            $("#icon-favourite-note").css("color", "#898989");
        }
    });
    $("#icon-favourite-note-new").mouseover(function () {
        $("#icon-favourite-note-new").css("color", "#ff9600");
    }).mouseout(function () {
        if (selectedNewNoteFavourite == 1) {
            $("#icon-favourite-note-new").css("color", "#ff9600");
        } else {
            $("#icon-favourite-note-new").css("color", "#898989");
        }
    });

    // Обработка логики подсветки иконки сортировки All
    if (curentSearchAttribute == "All") {
        $("#icon-all-search").css("color", "#ff9600");
    } else {
        $("#icon-all-search").css("color", "#898989");
    }
    $("#icon-all-search").mouseover(function () {
        $("#icon-all-search").css("color", "#ff9600");
    }).mouseout(function () {
        if (curentSearchAttribute == "All") {
            $("#icon-all-search").css("color", "#ff9600");
        } else {
            $("#icon-all-search").css("color", "#898989");
        }
    });

    // Обработка логики подсветки иконки сортировки Favourite
    if (curentSearchAttribute == "Favourite") {
        $("#icon-favourite-search").css("color", "#ff9600");
    } else {
        $("#icon-favourite-search").css("color", "#898989");
    }
    $("#icon-favourite-search").mouseover(function () {
        $("#icon-favourite-search").css("color", "#ff9600");
    }).mouseout(function () {
        if (curentSearchAttribute == "Favourite") {
            $("#icon-favourite-search").css("color", "#ff9600");
        } else {
            $("#icon-favourite-search").css("color", "#898989");
        }
    });

    // Обработчик Enter / Esc в текстовом поиске заметок
    $("#search-string").keypress(function (e) {
        if (e.which == 13) {
            TextSearch();
        }
        if (e.which == 27) {
            $("#search-string").val("");
            TextSearch();
        }
    });
            
    // Плавное появление иконок после загрузки
    $("#sort-button").show("fade", 500);
    $("#number-of-notes").show("fade", 500);
    $(".icon-left-set").show("fade", 0);
    $(".icon-left-set2").show("fade", 0);

    // Очищаем текстовый ввод нового блокнота и убираем оповещение об ошибке создания нового блокнота
    $("#new-folder-name").click(function () {
        $("#new-folder-name").val("");
        $('#new-folder-err-message').fadeOut(500);
    });
    
});

// Пересохранение хаметки после изменения
function ReSave() {
    var titleNote = escape($(".note-title").html());
    var bodyNote = escape($(".note-body").html());

    $.ajax({
        async: false,
        type: "POST",
        data: { title: titleNote, body: bodyNote, nt: selectedNoteNumber },
        url: "/Home/ReSave/",
        success: function () { },
        error: function () {
            alert("Kosyak pri sohranenii zamenki :(!");
        }
    }).done(function (respond) {});
};

// Отображение модального окна на удаление блокнота
function ModalDeleteFolder(obj) {
    obj.stopPropagation();
    obj.cancelBubble = true;
    folderToDel = obj.target.parentNode.dataset.folderId;
    $("#myModalDelete").modal('show');
}

// Удаление блокнота
function DeleteFolder() {
    var foldersNumber = document.getElementsByClassName("folder-list").length;
    if (foldersNumber == 3) {
        alert("Нельзя удалить последний блокнот...");
        $("#myModalDelete").modal('hide');
        ShowFolders();
        return;
    }
    $.ajax({
        async: false,
        type: "POST",
        data: { folderNumber: folderToDel },
        url: "/Home/DeleteFolder/"
    }).done(function (result) {
        $("#myModalDelete").modal('hide');
        ShowFolders();
    });
}

// Создание нового блокнота в БД
function CreateNewFolder() {
    var newFolderName = $("#new-folder-name").val();
    if (newFolderName != "") {
        $.ajax({
        async: false,
        type: "POST",
        data: { _new : newFolderName },
        url: "/Home/CreateNewFolder/",
        success: function () { }
    }).done(function (respond) {
        if (respond == "Fail") {
            $('#new-folder-err-message').fadeIn(400);
        }

        if (respond == "Ok") {
            $("#myModal").modal('hide');
            ShowFolders();
        }
    });
    }
}

// Отображаем модальное окно создания нового блокнота
function ShowNewFolderDialog() {
    $("#new-folder-name").val("");
    $("#myModal").modal('show');
}

// Открытие окна работы с блокнотами
function OpenFolderWindow() {
    $('.mask').show();

    $(".folder-window").toggle("fade", 300, function () {  });
    ShowFolders();
};

// Получаем Id корзины
function GetTrashId() {
    $.ajax({
        async: false,
        type: "POST",
        data: {},
        url: "/Home/GetTrashId/",
        success: function () { }
    }).done(function (respond) {
        trashId = respond[0].Id;
    });
};

// Получаем текущий (активный) блокнот
function GetCurrentFolder() {
    $.ajax({
        async: false,
        type: "POST",
        data: {  },
        url: "/Home/GetCurrentFolder/",
        success: function () {}
    }).done(function (respond) {
        currentFolderIdForSave = respond[0].Id;
        currentFolderIdForSave1 = respond[0].Id;
        currentFolderId = respond[0].Id;
        currentFolderName = respond[0].FolderName;
    });
};

// Отобразить список имеющихся блокнотов
function ShowFolders() {
    $.ajax({
        async: false,
        type: "POST",
        data: {  },
        url: "/Home/GetFoldersList/"
    }).done(function (partialViewResult) {
        $(".folder-bottom-block").html(partialViewResult);
    });
};

// Выбор всех блокнотов и отображение всех заметок
function SelectFolderAll() {
    allNotesSelect = true;
    trashSelected = false;
    //currentFolderId = null;

    $(".folder-window").fadeOut(500);
    $(".mask").fadeOut(500);

    curentSearchAttribute = "All";
    textSearchString = "";
    sortMethodAttr = 1;
    //currentFolderId = null;
    $("#search-string").val("");
    $("#icon-favourite-search").css("color", "#898989");
    $("#icon-all-search").css("color", "#ffac00");
    var text = $("#method1").text();
    $("#method1").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method2").html("По дате создания (новые внизу) ");
    $("#method3").html("По алфавиту (А-Я) ");
    $("#method4").html("По алфавиту (Я-А) ");
    ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
};

// Выбор папки Trash
function SelectFolderTrash(obj) {
    allNotesSelect = false;
    trashSelected = true;
    //currentFolderId = null;

    $(".folder-window").fadeOut(500);
    $(".mask").fadeOut(500);

    curentSearchAttribute = "All";
    textSearchString = "";
    sortMethodAttr = 1;
    //currentFolderId = null;
    $("#search-string").val("");
    $("#icon-favourite-search").css("color", "#898989");
    $("#icon-all-search").css("color", "#ffac00");
    var text = $("#method1").text();
    $("#method1").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method2").html("По дате создания (новые внизу) ");
    $("#method3").html("По алфавиту (А-Я) ");
    $("#method4").html("По алфавиту (Я-А) ");
    ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, $(obj).data('folder-id'));
};

// Выбор блокнота и отображение его заметок
function SelectFolder(obj) {
    trashSelected = false;
    //if ($(obj).data('folder-id') != null) {
        newFolId = $(obj).data('folder-id');
        $.ajax({
            async: false,
            type: "POST",
            data: { old: currentFolderId, _new: newFolId },
            url: "/Home/SetFolderCurrent/"
        }).done(function () {
            //if ($(obj).data('folder-name') != "Trash") {
                currentFolderId = $(obj).data('folder-id');
                currentFolderIdForSave = currentFolderId;
                currentFolderIdForSave1 = currentFolderId;
         });

        currentFolderName = $(obj).data('folder-name');
        allNotesSelect = false;
    
    $(".folder-window").fadeOut(500);
    $(".mask").fadeOut(500);

    curentSearchAttribute = "All"; 
    textSearchString = "";
    sortMethodAttr = 1;
    $("#search-string").val("");
    $("#icon-favourite-search").css("color", "#898989");
    $("#icon-all-search").css("color", "#ffac00");
    var text = $("#method1").text();
    $("#method1").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method2").html("По дате создания (новые внизу) ");
    $("#method3").html("По алфавиту (А-Я) ");
    $("#method4").html("По алфавиту (Я-А) ");
    
    ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};

// Выпадающее меню блокнотов
function GetFoldersDropDownMenu() {
    if (notesNumber != 0) {
        $.ajax({
            async: false,
            type: "POST",
            data: {},
            url: "/Home/GetFoldersDropDownMenu/"
        }).done(function (partialViewResult) {
            $("#dropdown-menu2").html(partialViewResult);
        });
    }
};

function GetFoldersDropDownMenuNewNote() {
    $.ajax({
        async: false,
        type: "POST",
        data: {},
        url: "/Home/GetFoldersDropDownMenuNewNote/"
    }).done(function (partialViewResult) {
        $("#dropdown-menu3").html(partialViewResult);
    });
};

function SelectCurrentFolderForSave(obj) {
    currentFolderIdForSave1 = $(obj)[0].dataset.folderid;
    currentFolderName1 = $(obj)[0].dataset.foldername;
    $(".current-folder2").html(currentFolderName1 + '<i class="caret"></i>');
};

// Выбор блокнота из выпадающего списка для перемещение в него текущей заметки
function MoveToFolder(obj) {
    var moveToFolder = $(obj)[0].dataset.folderid; //data('folderId');
    $.ajax({
        async: false,
        type: "POST",
        data: { noteNumber: selectedNoteNumber, toFolder: moveToFolder },
        url: "/Home/MoveToFolder/"
    }).done(function (result) {
        if (result == "Ok") {
            if (trashSelected) {
                trashSelected = false;
                currentFolderId = moveToFolder;
                ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, moveToFolder);
            }
            else
            {
                if (currentFolderId == null || currentFolderId == moveToFolder || allNotesSelect == true) {
                    SelectNote(lastNoteSelect);
                } else {
                    ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
                }
            }
            
        }
    });
};

// Функция ajax вовода списка заметок из БД в partialview
function ShowNotes(searchAttr, searchString, sortMethod, currFolder) {
    
    $.ajax({
        async: false,
        type: "POST",
        data: { searchAttribute : searchAttr, str : searchString, method : sortMethod, folder : currFolder },
        url: "/Home/GetNotesList/"
    }).done(function (partialViewResult) {
        $("#col-note-list-bottom-block").html(partialViewResult);
        // отображение первой заметки после загрузки списка заметок и выделение ее рамкой
        $(".note-title").html("");
        $(".note-body").html("");

        SelectNoteFirst();
        NumberOfNotes();
    });

        var l = document.getElementsByClassName("notes-list").length;

        for (var i = 0; i < l; i++) {
            var n = unescape(document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent.toString());
            var nn = n.replace(/\<p>/gi, "");
            nn = nn.replace(/\<\/p>/gi, " ");
            nn = nn.replace(/\<br>/gi, " ");
            nn = nn.replace(/\<div>/gi, " ");
            nn = nn.replace(/\<\/div>/gi, " ");
            nn = nn.replace(/\&nbsp;/gi, " ");
            nn = nn.replace(/\&amp;/gi, "&");
            document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent = nn;
        }
};


// Функция ajax выбора заметки из списка и ее просмотр
function SelectNote(obj) {
    // блок создания рамки вокруг выбранной заметки и отмены рамки вокруг ранее активного элемента
    $(lastNoteSelect).css("border", "0px");
    $(lastNoteSelect).css("border-bottom", "1px solid #e2e2e2");
    $(lastNoteSelect).css("padding", "8px");
    $(obj).css("border", "4px solid #999999");
    $(obj).css("padding", "4px");
    lastNoteSelect = obj;
    //**************************************
    var noteId = $(obj).data('note-id');
    selectedNoteNumber = noteId;
    $.ajax({
        async: false,
        type: "POST",
        data: { noteNumber: noteId },
        url: "/Home/GetNoteBody/",
        success: function (data) {
            $.each(data, function (index, note) { $('.note-title').html(unescape(note.Title)) });
            $.each(data, function (index, note) { $('.note-body').html(unescape(note.Body)) });
            $.each(data, function (index, note) {
                if (note.Favourite == 1) {
                    $("#icon-favourite-note").css("color", "#ff9600");
                    selectedNoteFavourite = note.Favourite;
                } else {
                    $("#icon-favourite-note").css("color", "#898989");
                    selectedNoteFavourite = note.Favourite;
                }
            });
            $.each(data, function (index, note) { $(".current-folder").html(note.FolderName + '<i class="caret"></i>'); });
        },
        error: function () { alert(Error); }
    });
};

// Функция ajax выбора первой заметки из списка и ее просмотр при загрузке страницы
function SelectNoteFirst() {
    var noteId = $("#col-note-list-item").data('note-id');
    $("#col-note-list-item").css("border", "4px solid #999999");
    $("#col-note-list-item").css("padding", "4px");
    lastNoteSelect = $("#col-note-list-item");
    selectedNoteNumber = noteId;
    $.ajax({
        async: false,
        type: "POST",
        data: { noteNumber: noteId },
        url: "/Home/GetNoteBody/",
        success: function () {},
        error: function () {
            //alert("В блоке вывода заметки {JavaScript}");
        }
    }).done(function (data) {
            $.each(data, function (index, note) { $('.note-title').html(unescape(note.Title)) });
            $.each(data, function (index, note) { $('.note-body').html(unescape(note.Body)) });
            $.each(data, function (index, note) {
                if (note.Favourite == 1) {
                    $("#icon-favourite-note").css("color", "#ff9600");
                    selectedNoteFavourite = note.Favourite;
                } else {
                    $("#icon-favourite-note").css("color", "#898989");
                    selectedNoteFavourite = note.Favourite;
                }
            });
            $.each(data, function (index, note) { $(".current-folder").html(note.FolderName + '<i class="caret"></i>'); });


            $("#col-note-list-bottom-block").animate({ scrollTop: 0 }, 300);


            
    });
};

// Функции показа и скрытия окна удаления заметки
function DeleteWindow() {
    $('.mask').show();
    $(".delete-window").toggle("fade", { direction: "right" }, 400);
    $('.mask').click(function(){
        $('.mask, .delete-window').fadeOut(500);
    });
};
function DeleteWindowHide() {
    $(".delete-window").toggle("fade", { direction: "right" }, 400);
    $('.mask, .delete-window').fadeOut(500);
};

// Функция удаления заметки из БД ajax, перегрузка списка заметок и выделение новой активной заметки
function DeleteNote() {
    // До удаления текущей активной заметки выбираем из DOM дерева предыдущую заметку (или следующую, если текущая является первой)
    // и сохраняем новый элемент, который будет активным в переменной j
    var elements = document.getElementsByClassName("notes-list");
    var j = 0;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].dataset.noteId == selectedNoteNumber) {
            if (i == 0) {
                j = elements[i + 1];
                break;
            }
            j = elements[i - 1];
            break;
        }
    }

    if (trashSelected) {
        // Отправляем ajax запрос в контроллер на удаление текущей заметки
        $.ajax({
            async: false,
            type: "POST",
            data: { noteNumber: selectedNoteNumber },
            url: "/Home/Delete/",
            success: function (respond) {
                if (respond == "Fail") {
                    alert("Что-то капитально пошло не так!!!");
                }
                // Если удаление прошло успешно, то продолжаем
                DeleteWindowHide();
                // Отправляем ajax запрос на вывод нового списка заметок после удаления

                if (allNotesSelect == true) {
                    //    currentFolderId = null;
                    tt = null;
                } else {
                    tt = currentFolderId;
                }


                $.ajax({
                    async: false,
                    type: "POST",
                    data: { searchAttribute: curentSearchAttribute, str: textSearchString, method: sortMethodAttr, folder: trashId }, //!!!!!!!
                    url: "/Home/GetNotesList/"
                }).done(function (partialViewResult) {
                    // Выводим заметки на экран
                    $("#col-note-list-bottom-block").html(partialViewResult);
                    // Ищем нужный элемент в новом списке по ID с елементом ранее сохраненном в j
                    // найденный элемент сохраняем в jj
                    NumberOfNotes();

                    var l = document.getElementsByClassName("notes-list").length;

                    for (var i = 0; i < l; i++) {
                        var n = unescape(document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent.toString());
                        var nn = n.replace(/\<p>/gi, "");
                        nn = nn.replace(/\<\/p>/gi, " ");
                        nn = nn.replace(/\<br>/gi, " ");
                        nn = nn.replace(/\<div>/gi, " ");
                        nn = nn.replace(/\<\/div>/gi, " ");
                        nn = nn.replace(/\&nbsp;/gi, " ");
                        nn = nn.replace(/\&amp;/gi, "&");
                        document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent = nn;
                    }


                    var elements1 = document.getElementsByClassName("notes-list");
                    var jj = 0;
                    for (var i = 0; i < elements1.length; i++) {
                        if (elements1[i].dataset.noteId == j.dataset.noteId) {
                            jj = elements[i];
                            break;
                        }
                    }
                    // выводим рамку вокруг нового активного элемента
                    if (jj != 0) {
                        jj.style.border = "4px solid #999999";
                        jj.style.padding = "4px";
                        lastNoteSelect = jj;
                        selectedNoteNumber = jj.dataset.noteId;
                        // Выводим содержимое заметки на экран
                        $.ajax({
                            async: false,
                            type: "POST",
                            data: { noteNumber: selectedNoteNumber },
                            url: "/Home/GetNoteBody/",
                            success: function (data) {
                                $.each(data, function (index, note) { $('.note-title').html(unescape(note.Title)) });
                                $.each(data, function (index, note) { $('.note-body').html(unescape(note.Body)) });
                                $.each(data, function (index, note) {
                                    if (note.Favourite == 1) {
                                        $("#icon-favourite-note").css("color", "#ff9600");
                                        selectedNoteFavourite = note.Favourite;
                                    } else {
                                        $("#icon-favourite-note").css("color", "#898989");
                                        selectedNoteFavourite = note.Favourite;
                                    }
                                });
                                $.each(data, function (index, note) { $(".current-folder").html(note.FolderName + '<i class="caret"></i>'); });
                            },
                            error: function () { alert(Error); }
                        });
                    } else {
                        $('.note-title').html("");
                        $('.note-body').html("");
                    }
                });
            },
            error: function () {
                $(".delete-window").hide();
                $('.mask, .delete-window').fadeOut(0);
                alert("There is no notes to delete!");
            }
        });
    }
    else
    {
        $.ajax({
            async: false,
            type: "POST",
            data: { noteNumber: selectedNoteNumber, toFolder: trashId },
            url: "/Home/MoveToFolder/",
            success: function (respond) {
                if (respond == "Fail") {
                    alert("Что-то капитально пошло не так при удалении из корзины!!!");
                }
                // Если удаление прошло успешно, то продолжаем
                DeleteWindowHide();
                // Отправляем ajax запрос на вывод нового списка заметок после удаления

                if (allNotesSelect == true) {
                    //    currentFolderId = null;
                    tt = null;
                } else {
                    tt = currentFolderId;
                }


                $.ajax({
                    async: false,
                    type: "POST",
                    data: { searchAttribute: curentSearchAttribute, str: textSearchString, method: sortMethodAttr, folder: tt }, //!!!!!!!
                    url: "/Home/GetNotesList/"
                }).done(function (partialViewResult) {
                    // Выводим заметки на экран
                    $("#col-note-list-bottom-block").html(partialViewResult);
                    // Ищем нужный элемент в новом списке по ID с елементом ранее сохраненном в j
                    // найденный элемент сохраняем в jj
                    NumberOfNotes();

                    var l = document.getElementsByClassName("notes-list").length;

                    for (var i = 0; i < l; i++) {
                        var n = unescape(document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent.toString());
                        var nn = n.replace(/\<p>/gi, "");
                        nn = nn.replace(/\<\/p>/gi, " ");
                        nn = nn.replace(/\<br>/gi, " ");
                        nn = nn.replace(/\<div>/gi, " ");
                        nn = nn.replace(/\<\/div>/gi, " ");
                        nn = nn.replace(/\&nbsp;/gi, " ");
                        nn = nn.replace(/\&amp;/gi, "&");
                        document.getElementsByClassName("notes-list")[i].firstChild.nextSibling.textContent = nn;
                    }

                    var elements1 = document.getElementsByClassName("notes-list");
                    var jj = 0;
                    for (var i = 0; i < elements1.length; i++) {
                        if (elements1[i].dataset.noteId == j.dataset.noteId) {
                            jj = elements[i];
                            break;
                        }
                    }
                    // выводим рамку вокруг нового активного элемента
                    if (jj != 0) {
                        jj.style.border = "4px solid #999999";
                        jj.style.padding = "4px";
                        lastNoteSelect = jj;
                        selectedNoteNumber = jj.dataset.noteId;
                        // Выводим содержимое заметки на экран
                        $.ajax({
                            async: false,
                            type: "POST",
                            data: { noteNumber: selectedNoteNumber },
                            url: "/Home/GetNoteBody/",
                            success: function (data) {
                                $.each(data, function (index, note) { $('.note-title').html(unescape(note.Title)) });
                                $.each(data, function (index, note) { $('.note-body').html(unescape(note.Body)) });
                                $.each(data, function (index, note) {
                                    if (note.Favourite == 1) {
                                        $("#icon-favourite-note").css("color", "#ff9600");
                                        selectedNoteFavourite = note.Favourite;
                                    } else {
                                        $("#icon-favourite-note").css("color", "#898989");
                                        selectedNoteFavourite = note.Favourite;
                                    }
                                });
                                $.each(data, function (index, note) { $(".current-folder").html(note.FolderName + '<i class="caret"></i>'); });
                            },
                            error: function () { alert(Error); }
                        });
                    } else {
                        $('.note-title').html("");
                        $('.note-body').html("");
                    }
                });
            },
            error: function () {
                $(".delete-window").hide();
                $('.mask, .delete-window').fadeOut(0);
                alert("There is no notes to delete!");
            }
        });
    }
};

// Показ количества заметок
function NumberOfNotes() {
    notesNumber = document.getElementsByClassName("notes-list").length;
    $('#number-of-notes').html("Заметок: " + notesNumber);
};

// Вывод окна ввода новой заметки
function NewNote() {
    $('.whole-page').show();
    $('.new-note-window').show();
    $('.new-note-window').animate({ left: '-=250' }, 400, function () {  });
    
    $(".current-folder2").html(currentFolderName + '<i class="caret"></i>');
};
function NewNoteHide() {
    $('.new-note-window').animate({ left: '+=250' }, 300, function () { $('.whole-page').hide(); });
};

// Сохранение новой заметки в базе
function NewNoteSave() {
    var titleNote = escape($(".note-title2").html());
    var bodyNote = escape($(".note-body2").html());
    //alert(bodyNote);
    //var cf = currentFolderIdForSave;
    //GetCurrentFolder();

    $.ajax({
        async: false,
        type: "POST",
        data: { title: titleNote, body: bodyNote, favourite: selectedNewNoteFavourite, folder: currentFolderIdForSave1 },
        url: "/Home/Save/",
        success: function () {},
        error: function () {
            alert("Kosyak pri sohranenii zamenki :(!");
        }
    }).done(function (respond) {
        $('.new-note-window').animate({ left: '+=250' }, 300, function () {
            $('.whole-page').hide();
            $(".note-title2").html("");
            $(".note-body2").html("");

            selectedNewNoteFavourite = 0;
            $("#icon-favourite-note-new").css("color", "#898989");
        });
        curentSearchAttribute = "All";
        textSearchString = "";
        $("#search-string").val("");
        $("#icon-favourite-search").css("color", "#898989");
        $("#icon-all-search").css("color", "#ff9600");

        if (allNotesSelect == false) {
            //currentFolderId = currentFolderIdForSave;
            if (currentFolderId != currentFolderIdForSave1) {
                ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
            } else
            {
                ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
            }
            
        }
        else {
            ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
        }
        
    });
};

// Установка признака "избранное" и его сохранение в базе
function SetFavourite() {
    if (notesNumber != 0) {

        if (selectedNoteFavourite == 0) {
            $("#icon-favourite-note").css("color", "#ff9600");
            selectedNoteFavourite = 1;
        } else {
            $("#icon-favourite-note").css("color", "#898989");
            selectedNoteFavourite = 0;
        }

        $.ajax({
            async: false,
            type: "POST",
            data: { noteNumber: selectedNoteNumber, favourite: selectedNoteFavourite },
            url: "/Home/SetFavourite/",
            success: function () { },
            error: function () {
                alert("Kosyak pri sohranenii statusa \"izbrannoe\" :(!");
            }
        }).done(function (respond) {
            if (respond == "Fail") {
                alert("Kosyak pri sohranenii statusa \"izbrannoe\" :(!");
            }
        });
    }
};
function SetFavouriteNewNote() {
    if (selectedNewNoteFavourite == 0) {
        $("#icon-favourite-note-new").css("color", "#ff9600");
        selectedNewNoteFavourite = 1;
    } else {
        $("#icon-favourite-note-new").css("color", "#898989");
        selectedNewNoteFavourite = 0;
    }
};

// Блок функций отбора заметок по признаку All/Favourite/Text string
function AllSearch() {
    curentSearchAttribute = "All";
    textSearchString = "";
    $("#search-string").val("");
    $("#icon-favourite-search").css("color", "#898989");
    $("#icon-text-search").css("color", "#898989");
    //textSearchString = $("#search-string").val();
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
function FavouriteSearch() {
    curentSearchAttribute = "Favourite";
    $("#icon-all-search").css("color", "#898989");
    $("#icon-text-search").css("color", "#898989");
    textSearchString = $("#search-string").val();
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
function TextSearch() {
    textSearchString = $("#search-string").val();
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
//*****************************************

// Блок функций сортировки из выпадающего списка "Сортировка"
function SortMethod1() {
    sortMethodAttr = 1;
    var text = $("#method1").text();
    $("#method1").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method2").html("По дате создания (новые внизу) ");
    $("#method3").html("По алфавиту (А-Я) ");
    $("#method4").html("По алфавиту (Я-А) ");
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
function SortMethod2() {
    sortMethodAttr = 2;
    var text = $("#method2").text();
    $("#method2").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method1").html("По дате создания (новые вверху) ");
    $("#method3").html("По алфавиту (А-Я) ");
    $("#method4").html("По алфавиту (Я-А) ");
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
function SortMethod3() {
    sortMethodAttr = 3;
    var text = $("#method3").text();
    $("#method3").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method1").html("По дате создания (новые вверху) ");
    $("#method2").html("По дате создания (новые внизу) ");
    $("#method4").html("По алфавиту (Я-А) ");
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
function SortMethod4() {
    sortMethodAttr = 4;
    var text = $("#method4").text();
    $("#method4").html(text + '<span class="glyphicon glyphicon-ok"></span>');
    $("#method1").html("По дате создания (новые вверху) ");
    $("#method2").html("По дате создания (новые внизу) ");
    $("#method3").html("По алфавиту (А-Я) ");
    if (allNotesSelect == true) {
        ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, null);
    } else ShowNotes(curentSearchAttribute, textSearchString, sortMethodAttr, currentFolderId);
};
//*************************************************************************

