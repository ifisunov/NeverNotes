using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;

namespace MyNotes.Models
{
    public class NoteDbInit : DropCreateDatabaseIfModelChanges<ApplicationDbContext>
    {
        
        protected override void Seed(ApplicationDbContext context)
        {
            context.Notes.Add(new Note { Title = "Первая заметка 1", DateOfCreation = DateTime.Now, DateOfChanging = DateTime.Now, Body = "Класс DropCreateDatabaseAlways позволяет при каждом новом запуске заполнять базу данных заново некоторыми начальными данными. В качестве таких начальных значений здесь создаются три объекта Book. Используя метод db.Books.Add мы добавляем каждый такой объект в базу данных. Однако чтобы этот класс действительно сработал, и заполнение базы данных произошло, нам надо запустить его при запуске приложения." });
            context.Notes.Add(new Note { Title = "Вторая заметка 2", DateOfCreation = DateTime.Now, DateOfChanging = DateTime.Now, Body = "И если мы откроем папку проекта на жестком диске и в этой папке перейдем к каталогу App_Data, то сможем увидеть только что созданную базу данных Bookstore.mdf, которая и хранит эти данные по умолчанию." });
            context.Notes.Add(new Note { Title = "Третья заметка 3", DateOfCreation = DateTime.Now, DateOfChanging = DateTime.Now, Body = "Хотя здесь два метода, но в целом они составляют одно действие Buy, только первый метод срабатывает при получении запроса GET, а второй - при получении запроса POST. С помощью атрибутов [HttpGet] и [HttpPost] мы можем указать, какой метод какой тип запроса обрабатывает." });

            base.Seed(context);
        }
    }
}