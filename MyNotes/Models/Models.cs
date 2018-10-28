using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MyNotes.Models
{
    public class Folder
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FolderName { get; set; }
        public bool FolderCurrent { get; set; }

        public ICollection<Note> Notes { get; set; }

        public Folder()
        {
            Notes = new List<Note>();
        }
    }

    public class Note
    {
        // Id заметки
        public int Id { get; set; }
        // Id юзера 
        public string UserId { get; set; }
        // Заголовок заметки
        public string Title { get; set; }
        // Тело заметки??? Отделный файл html?
        public string Body { get; set; }
        // Дата создания заметки
        public DateTime DateOfCreation { get; set; }
        // Дата изменения заметки
        public DateTime DateOfChanging { get; set; }
        // Цветовая метка заметки
        public int Color { get; set; }
        // Избранное
        public int Favourite { get; set; }

        // Метки заметки :)
        // public string[] Tags { get; set; }


        // Блокнот в котором находится заметка
        public int? FolderId { get; set; }
        public Folder Folder { get; set; }
    }

    public class NoteTest
    {
        // Id заметки
        public int Id { get; set; }
        // Id юзера 
        public string UserId { get; set; }
        // Заголовок заметки
        public string Title { get; set; }
        // Тело заметки??? Отделный файл html?
        public string Body { get; set; }
        // Дата создания заметки
        public DateTime DateOfCreation { get; set; }
        // Дата и
    }

}