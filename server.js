require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());
function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).send("No token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).send("เฉพาะ Admin เท่านั้น");
    }

    next();
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
}

// connect MongoDB
mongoose.connect("mongodb://localhost:27017/mydb")
  .then(() => console.log("MongoDB connected"));

// schema
const Admin = mongoose.model("Admin", {
  fullname: String,
  username: String,
  password: String,
  phone: String,
  address: String,
  email: String,
  role: {
    type: String,
    default: "admin"
  }
});
const User = mongoose.model("User", {
  fullname: String,
  username: String,
  password: String,
  phone: String,
  address: String,
  email: String,
  role: {
    type: String,
    default: "user" 
  }
});


const Doctor = mongoose.model("Doctor", {
  fullname: String,
  username: String,
  password: String,
  phone: String,
  address: String,
  email: String,
  role: {
    type: String,
    default: "doctor"
  }
});

// ================= REGISTER =================
app.post("/signup", async (req, res) => {
  try {
    console.log("DATA:", req.body);

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      ...req.body,
      password: hashedPassword
    });

    await user.save();

    console.log("SAVED!");
    res.send("สมัครสมาชิกสำเร็จ");

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).send("error");
  }
});



// ================= LOGIN =================
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   const user = await User.findOne({ username });
//   if (!user) return res.status(404).send("ไม่พบผู้ใช้");

//   // compare password
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).send("รหัสผ่านผิด");

//   // create token
//   const token = jwt.sign(
//     { id: user._id },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" }
//   );

// res.json({
//   token,
//   role: user.role
// });
// });
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   // 🔹 1. หาใน users ก่อน (admin + user)
//   let account = await User.findOne({ username });

//   // 🔹 2. ถ้าไม่เจอ → หาใน doctor
//   if (!account) {
//     account = await Doctor.findOne({ username });
//   }

//   if (!account) {
//     return res.status(404).send("ไม่พบผู้ใช้");
//   }

//   const isMatch = await bcrypt.compare(password, account.password);

//   if (!isMatch) {
//     return res.status(401).send("รหัสผ่านผิด");
//   }

//   const token = jwt.sign(
//     {
//       id: account._id,
//       role: account.role || "doctor" // 👈 หมอไม่มี role ก็ให้เป็น doctor
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" }
//   );

//   res.json({
//     token,
//     role: account.role || "doctor"
//   });
// });
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let account =
    await Admin.findOne({ username }) ||
    await User.findOne({ username }) ||
    await Doctor.findOne({ username });

  if (!account) {
    return res.status(404).send("ไม่พบผู้ใช้");
  }

  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) {
    return res.status(401).send("รหัสผ่านผิด");
  }

  const token = jwt.sign(
    { id: account._id, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

    res.json({ token, role: account.role });
});
// =================ดึงข้อมูลผู้ใช้ =================
app.get("/get_all", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const doctors = await Doctor.find().select("-password");
    const admins = await Admin.find().select("-password"); 
    res.json({
      users,
      admins,
      doctors
    });

  } catch (err) {
    res.status(500).send("error");
  }
});

app.post("/add_user", verifyAdmin, async (req, res) => {
  const { fullname, username, password, email, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    fullname,
    username,
    password: hashed,
    email,
    phone
  });

  await user.save();
  res.json({ message: "เพิ่ม User สำเร็จ" });
});
app.post("/add_doctor", verifyAdmin, async (req, res) => {
  const { fullname, username, password, email, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const doctor = new Doctor({
    fullname,
    username,
    password: hashed,
    email,
    phone
  });

  await doctor.save();
  res.json({ message: "เพิ่ม Doctor สำเร็จ" });
});
app.post("/add_admin", verifyAdmin, async (req, res) => {
  const { fullname, username, password, email, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const admin = new Admin({
    fullname,
    username,
    password: hashed,
    email,
    phone
  });

  await admin.save();
  res.json({ message: "เพิ่ม Admin สำเร็จ" });
});

app.post("/update_user", async (req, res) => {
  try {
    const { id, name, email, phone } = req.body;

    await User.findByIdAndUpdate(id, {
      fullname: name,
      email,
      phone
    });

    res.json({ message: "อัปเดตสำเร็จ" });

  } catch (err) {
    res.status(500).send("error");
  }
});
app.post("/update_role", async (req, res) => {
  const { userId, role } = req.body;

  await User.findByIdAndUpdate(userId, { role });

  res.json({ message: "อัปเดต role สำเร็จ" });
});
app.post("/delete_user", async (req, res) => {
try {
    const { userId } = req.body;

    console.log("DELETE ID:", userId);
    await User.findByIdAndDelete(userId);

    res.json({ message: "ลบสำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});



// ================= PROTECTED =================
app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account =
      await Admin.findById(decoded.id) ||
      await User.findById(decoded.id) ||
      await Doctor.findById(decoded.id);

    if (!account) {
      return res.status(404).send("ไม่พบข้อมูล");
    }

    res.json(account);

  } catch (err) {
    res.status(401).send("unauthorized");
  }
});


app.listen(3000, () => console.log("Server running"));