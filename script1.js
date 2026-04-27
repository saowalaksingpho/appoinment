document.addEventListener('DOMContentLoaded', function () {
  // ชื่อผู้ใช้ (ดึงจากระบบหรือจำลองข้อมูล)
  const userName = "";
  document.getElementById("userName").innerText = userName;

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'th',
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next' 
        },
        dateClick: function (info) {
            document.getElementById("selectedDate").value = info.dateStr;
        }
    });
  calendar.render();

  // จัดการฟอร์มการนัดหมาย
  const form = document.getElementById("appointmentForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedDate = document.getElementById("selectedDate").value;
    const time = document.getElementById("appointmentTime").value;
    const details = document.getElementById("appointmentDetails").value;

    // if (!selectedDate || !time || !details) {
    //   alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
    //   return;
    // }

    // บันทึกข้อมูล (ดึงไปยังฐานข้อมูล)
    // const appointmentData = {
    //   user: userName,
    //   date: selectedDate,
    //   time: time,
    //   details: details,
    // };

    // console.log("บันทึกการนัดหมาย:", appointmentData);
    // alert("บันทึกการนัดหมายสำเร็จ!");

    // เคลียร์ฟอร์ม
    // form.reset();
  });
//   form.addEventListener("submit", function (e) {
//     e.preventDefault();

//     const selectedDate = document.getElementById("selectedDate").value;
//     const time = document.getElementById("appointmentTime").value;
//     const details = document.getElementById("appointmentDetails").value;

//     if (!selectedDate || !time || !details) {
//         alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
//         return;
//     }

//     // ดึงข้อมูลเก่าจาก Local Storage
//     let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

//     // เพิ่มข้อมูลใหม่
//     const appointmentData = {
//         user: userName,
//         date: selectedDate,
//         time: time,
//         details: details,
//     };
//     appointments.push(appointmentData);

//     // บันทึกลง Local Storage
//     localStorage.setItem("appointments", JSON.stringify(appointments));

//     alert("บันทึกการนัดหมายสำเร็จ!");

//     // เคลียร์ฟอร์ม
//     form.reset();
// });

});
