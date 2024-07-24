import * as Yup from "yup"
import { isObject, useFormik } from "formik"
import { validateEmailError, validateFitLengthError, validateMaxLengthError, validateMinLengthError, validateRequiredError } from "./utilities/validateErrors"
import { useEffect, useMemo} from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addMessageContactUs, changeLoadDoctors, changeLoadTimes, getDoctors, getTimes } from "./utilities/redux/slices/patientSlice";
import { getCookie, useAddPatientMutation, useGetDataQuery, useLazyCancelVisitQuery } from "./utilities/redux/slices/rtkQueryPatients";


function App() {
  const { departments, doctors, times, loadDoctors, loadTimes, msgPending, msgFulfilled } = useSelector(state => state.sliceReducer)
  const [addPatient, { isError, isLoading, isSuccess, data: addPatientToken, isUninitialized }] = useAddPatientMutation()
  const { data: dataOfCookie, isLoading: getDataOfCookieLoad, isSuccess: getDataOfCookieSuccess } = useGetDataQuery()
  const [cancelVisit, { isSuccess: cancelVisitSuccess }] = useLazyCancelVisitQuery()

  const validator = Yup.object(
    {
      name: Yup.string().min(5, validateMinLengthError(7)).max(40, validateMaxLengthError(40)).required(validateRequiredError),
      phone: Yup.string().length(11, validateFitLengthError(11)).required(validateRequiredError),
      email: Yup.string().email(validateEmailError).required(validateRequiredError),
      department: Yup.string().test(
        'department',
        'ساختمان غلط',
        function (item) {
          return departments.find(x => x.id === item) === undefined
        }
      ).required(validateRequiredError),
      doctor: Yup.string().test(
        'doctor',
        'دکتر غلط',
        function (item) {
          return doctors.find(x => x.id === item) !== undefined
        }
      ).required(validateRequiredError),
      time: Yup.string().test(
        'time',
        'ساعت غلط',
        function (item) {
          return [...times, { id: dataOfCookie?.visitTimeID || -1 }].find(x => x.id == item) !== undefined
        }
      ).required(validateRequiredError)
    }
  )

  const formik = useFormik(
    {
      validationSchema: validator,
      initialValues: {
        name: "",
        phone: "",
        email: "",
        department: "",
        doctor: "",
        message: "",
        time: 0,
      },

      onSubmit: (values) => {
        if (JSON.stringify(obj) === JSON.stringify(formik.values)) {
          cancelVisit()
        } else {
          const UserName = values.name
          const Email = values.email
          const PhoneNumber = values.phone
          const Comment = values.message
          const VisitTimeID = values.time
          const val = { UserName, Email, PhoneNumber, Comment, VisitTimeID }
          addPatient(val)
        }
      }
    }
  )

  const disPatch = useDispatch();

  if (cancelVisitSuccess) {
    document.cookie = `token=${addPatientToken}; expires=${new Date(new Date().getTime() - 900).toUTCString()}; path=/`;
    window.location.reload()
  }

  var obj = useMemo(() => {
    if (getDataOfCookieSuccess) {
      var ob = {
        name: dataOfCookie.userName,
        phone: dataOfCookie.phoneNumber,
        email: dataOfCookie.email,
        department: dataOfCookie.departmentID,
        doctor: dataOfCookie.doctorID,
        message: dataOfCookie.comment,
        time: dataOfCookie.visitTimeID,
      }
      formik.setValues(ob)
      return ob
    }
  }, [getDataOfCookieSuccess])


  const getDoctorsF = async (id) => {
    disPatch(changeLoadDoctors(true))
    const { data: getDoctors1 } = await axios.get("https://localhost:7087/Auth/doctors/" + id)
    disPatch(getDoctors(getDoctors1))
    disPatch(changeLoadDoctors(false))
  }

  const getTimesF = async (id) => {
    disPatch(changeLoadTimes(true))
    const { data: getDoctors1 } = await axios.get("https://localhost:7087/Auth/times/" + id)
    disPatch(getTimes(getDoctors1))
    disPatch(changeLoadTimes(false))
  }

  useEffect(
    () => {
      var departmentSelected = formik.values.department;
      if (departmentSelected) getDoctorsF(formik.values.department)
    }, [formik.values.department]
  )

  useEffect(
    () => {
      var doctorSelected = formik.values.doctor;
      if (doctorSelected) getTimesF(formik.values.doctor)
    }, [formik.values.doctor]
  )

  useEffect(
    () => {
      formik.setValues({ ...formik.values, time: parseInt(formik.values.time) })
    }, [formik.values.time]
  )

  if (isSuccess) {
    document.cookie = `token=${addPatientToken}; expires=${new Date(new Date().getTime() + 900000000).toUTCString()}; path=/`;
  }

  var time = dataOfCookie?.visitTime.split("T")[0].split("-")
  if (time) {
    time[0] = parseInt(time[0])
    time[1] = parseInt(time[1])
    time[2] = parseInt(time[2])
    time = farvardin.gregorianToSolar(time[0], time[1], time[2], "string")
  }

  const ContactUsValidator = Yup.object({
    name: Yup.string().min(5, validateMinLengthError(7)).max(40, validateMaxLengthError(40)).required(validateRequiredError),
    email: Yup.string().email(validateEmailError).required(validateRequiredError),
    subject: Yup.string().required(validateRequiredError),
    message: Yup.string().required(validateRequiredError)
  })


  const FormikContactUs = useFormik(
    {
      validationSchema: ContactUsValidator,
      initialValues: {
        name: "",
        email: "",
        subject: "",
        message: ""
      },
      onSubmit: (values) => {
        disPatch(addMessageContactUs(values))
      }
    }
  )

  useEffect(
    () => {
      const contactCookie = getCookie("contact")
      if (contactCookie != "") {
        const formikInitialValues = JSON.parse(decodeURIComponent(escape(window.atob(contactCookie))))
        FormikContactUs.setValues(formikInitialValues)
      }
    }, []
  )
  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="hero section light-background">
        <img src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" />
        <div className="container position-relative">
          <div
            className="welcome position-relative"
            data-aos="fade-down"
            data-aos-delay={100}
          >
            <h2>WELCOME TO MEDILAB</h2>
            <p>We are team of talented designers making websites with Bootstrap</p>
          </div>
          {/* End Welcome */}
          <div className="content row gy-4">
            <div className="col-lg-4 d-flex align-items-stretch">
              <div className="why-box" data-aos="zoom-out" data-aos-delay={200}>
                <h3>Why Choose Medilab?</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis
                  aute irure dolor in reprehenderit Asperiores dolores sed et.
                  Tenetur quia eos. Autem tempore quibusdam vel necessitatibus optio
                  ad corporis.
                </p>
                <div className="text-center">
                  <a href="#about" className="more-btn">
                    <span>Learn More</span> <i className="bi bi-chevron-right" />
                  </a>
                </div>
              </div>
            </div>
            {/* End Why Box */}
            <div className="col-lg-8 d-flex align-items-stretch">
              <div className="d-flex flex-column justify-content-center">
                <div className="row gy-4">
                  <div className="col-xl-4 d-flex align-items-stretch">
                    <div
                      className="icon-box"
                      data-aos="zoom-out"
                      data-aos-delay={300}
                    >
                      <i className="bi bi-clipboard-data" />
                      <h4>Corporis voluptates officia eiusmod</h4>
                      <p>
                        Consequuntur sunt aut quasi enim aliquam quae harum pariatur
                        laboris nisi ut aliquip
                      </p>
                    </div>
                  </div>
                  {/* End Icon Box */}
                  <div className="col-xl-4 d-flex align-items-stretch">
                    <div
                      className="icon-box"
                      data-aos="zoom-out"
                      data-aos-delay={400}
                    >
                      <i className="bi bi-gem" />
                      <h4>Ullamco laboris ladore pan</h4>
                      <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt
                      </p>
                    </div>
                  </div>
                  {/* End Icon Box */}
                  <div className="col-xl-4 d-flex align-items-stretch">
                    <div
                      className="icon-box"
                      data-aos="zoom-out"
                      data-aos-delay={500}
                    >
                      <i className="bi bi-inboxes" />
                      <h4>Labore consequatur incidid dolore</h4>
                      <p>
                        Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut
                        maiores omnis facere
                      </p>
                    </div>
                  </div>
                  {/* End Icon Box */}
                </div>
              </div>
            </div>
          </div>
          {/* End  Content*/}
        </div>
      </section>
      {/* /Hero Section */}
      {/* About Section */}
      <section id="about" className="about section">
        <div className="container">
          <div className="row gy-4 gx-5">
            <div
              className="col-lg-6 position-relative align-self-start"
              data-aos="fade-up"
              data-aos-delay={200}
            >
              <img src="/assets/img/about.jpg" className="img-fluid" alt="" />
              <a
                href="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                className="glightbox pulsating-play-btn"
              />
            </div>
            <div
              className="col-lg-6 content"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              <h3>About Us</h3>
              <p>
                Dolor iure expedita id fuga asperiores qui sunt consequatur minima.
                Quidem voluptas deleniti. Sit quia molestiae quia quas qui magnam
                itaque veritatis dolores. Corrupti totam ut eius incidunt reiciendis
                veritatis asperiores placeat.
              </p>
              <ul>
                <li>
                  <i className="fa-solid fa-vial-circle-check" />
                  <div>
                    <h5>Ullamco laboris nisi ut aliquip consequat</h5>
                    <p>
                      Magni facilis facilis repellendus cum excepturi quaerat
                      praesentium libre trade
                    </p>
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-pump-medical" />
                  <div>
                    <h5>Magnam soluta odio exercitationem reprehenderi</h5>
                    <p>
                      Quo totam dolorum at pariatur aut distinctio dolorum
                      laudantium illo direna pasata redi
                    </p>
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-heart-circle-xmark" />
                  <div>
                    <h5>Voluptatem et qui exercitationem</h5>
                    <p>
                      Et velit et eos maiores est tempora et quos dolorem autem
                      tempora incidunt maxime veniam
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* /About Section */}
      {/* Stats Section */}
      <section id="stats" className="stats section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay={100}>
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
              <i className="fa-solid fa-user-doctor" />
              <div className="stats-item">
                <span
                  data-purecounter-start={0}
                  data-purecounter-end={85}
                  data-purecounter-duration={1}
                  className="purecounter"
                />
                <p>Doctors</p>
              </div>
            </div>
            {/* End Stats Item */}
            <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
              <i className="fa-regular fa-hospital" />
              <div className="stats-item">
                <span
                  data-purecounter-start={0}
                  data-purecounter-end={18}
                  data-purecounter-duration={1}
                  className="purecounter"
                />
                <p>Departments</p>
              </div>
            </div>
            {/* End Stats Item */}
            <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
              <i className="fas fa-flask" />
              <div className="stats-item">
                <span
                  data-purecounter-start={0}
                  data-purecounter-end={12}
                  data-purecounter-duration={1}
                  className="purecounter"
                />
                <p>Research Labs</p>
              </div>
            </div>
            {/* End Stats Item */}
            <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
              <i className="fas fa-award" />
              <div className="stats-item">
                <span
                  data-purecounter-start={0}
                  data-purecounter-end={150}
                  data-purecounter-duration={1}
                  className="purecounter"
                />
                <p>Awards</p>
              </div>
            </div>
            {/* End Stats Item */}
          </div>
        </div>
      </section>
      {/* /Stats Section */}
      {/* Services Section */}
      <section id="services" className="services section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Services</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row gy-4">
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              <div className="service-item  position-relative">
                <div className="icon">
                  <i className="fas fa-heartbeat" />
                </div>
                <a href="#" className="stretched-link">
                  <h3>Nesciunt Mete</h3>
                </a>
                <p>
                  Provident nihil minus qui consequatur non omnis maiores. Eos
                  accusantium minus dolores iure perferendis tempore et consequatur.
                </p>
              </div>
            </div>
            {/* End Service Item */}
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={200}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-pills" />
                </div>
                <a href="#" className="stretched-link">
                  <h3>Eosle Commodi</h3>
                </a>
                <p>
                  Ut autem aut autem non a. Sint sint sit facilis nam iusto sint.
                  Libero corrupti neque eum hic non ut nesciunt dolorem.
                </p>
              </div>
            </div>
            {/* End Service Item */}
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={300}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-hospital-user" />
                </div>
                <a href="#" className="stretched-link">
                  <h3>Ledo Markt</h3>
                </a>
                <p>
                  Ut excepturi voluptatem nisi sed. Quidem fuga consequatur. Minus
                  ea aut. Vel qui id voluptas adipisci eos earum corrupti.
                </p>
              </div>
            </div>
            {/* End Service Item */}
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={400}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-dna" />
                </div>
                <a href="#" className="stretched-link">
                  <h3>Asperiores Commodit</h3>
                </a>
                <p>
                  Non et temporibus minus omnis sed dolor esse consequatur.
                  Cupiditate sed error ea fuga sit provident adipisci neque.
                </p>
                <a href="#" className="stretched-link" />
              </div>
            </div>
            {/* End Service Item */}
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={500}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-wheelchair" />
                </div>
                <a href="#" className="stretched-link">
                  <h3>Velit Doloremque</h3>
                </a>
                <p>
                  Cumque et suscipit saepe. Est maiores autem enim facilis ut aut
                  ipsam corporis aut. Sed animi at autem alias eius labore.
                </p>
                <a href="#" className="stretched-link" />
              </div>
            </div>
            {/* End Service Item */}
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={600}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-notes-medical" />
                </div>
                <a href="#" className="stretched-link">
                  <h3>Dolori Architecto</h3>
                </a>
                <p>
                  Hic molestias ea quibusdam eos. Fugiat enim doloremque aut neque
                  non et debitis iure. Corrupti recusandae ducimus enim.
                </p>
                <a href="#" className="stretched-link" />
              </div>
            </div>
            {/* End Service Item */}
          </div>
        </div>
      </section>
      {/* /Services Section */}
      {/* Appointment Section */}
      <section id="appointment" className="appointment section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Appointment</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container" data-aos="fade-up" data-aos-delay={100}>
          <form
            onSubmit={formik.handleSubmit}
            className="php-email-form"
          >
            <div className="row">
              <div className="col-md-4 form-group">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  id="name"
                  placeholder="Your Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <span className="text-danger">{(formik.errors?.name && formik.touched.name) && formik.errors.name}</span>
              </div>
              <div className="col-md-4 form-group mt-3 mt-md-0">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  id="email"
                  placeholder="Your Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <span className="text-danger">{(formik.errors?.email && formik.touched.email) && formik.errors.email}</span>
              </div>
              <div className="col-md-4 form-group mt-3 mt-md-0">
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  id="phone"
                  placeholder="Your Phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <span className="text-danger">{(formik.errors?.phone && formik.touched.phone) && formik.errors.phone}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 form-group mt-3">
                <select
                  name="department"
                  id="department"
                  className="form-select"
                  required=""
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select Department</option>
                  {
                    departments.map(
                      (item) => (
                        <option value={item.id}>{item.departmentName}</option>
                      )
                    )
                  }
                </select>
                <span className="text-danger">{(formik.errors?.department && formik.touched.department) && formik.errors.department}</span>
              </div>


              <div className="col-md-4 form-group mt-3">
                <select
                  name="doctor"
                  id="doctor"
                  className="form-select"
                  required=""
                  value={formik.values.doctor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">{!loadDoctors ? "Select Doctor" : "درحال گرفتن دکتر"}</option>
                  {
                    !loadDoctors && (
                      doctors.map(
                        item => (
                          <option value={item.id}>{item.userName}</option>
                        )
                      )
                    )
                  }
                </select>
                <span className="text-danger">{(formik.errors?.doctor && formik.touched.doctor) && formik.errors.doctor}</span>
              </div>

              <div className="col-md-4 form-group mt-3">
                <select
                  name="time"
                  id="time"
                  className="form-select"
                  required=""
                  value={formik.values.time}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">{!loadTimes ? "Select Time" : "درحال گرفتن زمان"}</option>
                  {time && <option value={dataOfCookie.visitTimeID}>{time}</option>}
                  {
                    !loadTimes && (
                      times.map(
                        item => (
                          <option value={item.id}>{item.visitTime}</option>
                        )
                      )
                    )
                  }
                </select>
                <span className="text-danger">{(formik.errors?.time && formik.touched.time) && formik.errors.time}</span>
              </div>
            </div>




            <div className="form-group mt-3">
              <textarea
                className="form-control"
                name="message"
                rows={5}
                placeholder="Message (Optional)"
                value={formik.values.message}
                onChange={formik.handleChange}
              />
            </div>
            <div className="mt-3">
              <div className="loading">Loading</div>
              <div className="error-message" />
              <div className="sent-message">
                Your appointment request has been sent successfully. Thank you!
              </div>
              <div className="text-center">
                {isLoading && <button type="submit">sending...</button>}
                {isError && <button type="submit">Error</button>}
                {isSuccess && <button type="submit">Success</button>}
                {isUninitialized && <button type="submit" style={{ background: "var(--accent-color)", border: 0, padding: "10px 35px", color: "#fff", transition: "0.4s", borderRadius: "50px" }}>{JSON.stringify(obj) === JSON.stringify(formik.values) ? "cancel" : "Make an Appointment"}</button>}
              </div>
            </div>
          </form>
        </div >
      </section >
      {/* /Appointment Section */}
      {/* Departments Section */}
      <section id="departments" className="departments section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Departments</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container" data-aos="fade-up" data-aos-delay={100}>
          <div className="row">
            <div className="col-lg-3">
              <ul className="nav nav-tabs flex-column">
                <li className="nav-item">
                  <a
                    className="nav-link active show"
                    data-bs-toggle="tab"
                    href="#departments-tab-1"
                  >
                    Cardiology
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="tab"
                    href="#departments-tab-2"
                  >
                    Neurology
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="tab"
                    href="#departments-tab-3"
                  >
                    Hepatology
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="tab"
                    href="#departments-tab-4"
                  >
                    Pediatrics
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="tab"
                    href="#departments-tab-5"
                  >
                    Eye Care
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-9 mt-4 mt-lg-0">
              <div className="tab-content">
                <div className="tab-pane active show" id="departments-tab-1">
                  <div className="row">
                    <div className="col-lg-8 details order-2 order-lg-1">
                      <h3>Cardiology</h3>
                      <p className="fst-italic">
                        Qui laudantium consequatur laborum sit qui ad sapiente dila
                        parde sonata raqer a videna mareta paulona marka
                      </p>
                      <p>
                        Et nobis maiores eius. Voluptatibus ut enim blanditiis atque
                        harum sint. Laborum eos ipsum ipsa odit magni. Incidunt hic
                        ut molestiae aut qui. Est repellat minima eveniet eius et
                        quis magni nihil. Consequatur dolorem quaerat quos qui
                        similique accusamus nostrum rem vero
                      </p>
                    </div>
                    <div className="col-lg-4 text-center order-1 order-lg-2">
                      <img
                        src="/assets/img/departments-1.jpg"
                        alt=""
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
                <div className="tab-pane" id="departments-tab-2">
                  <div className="row">
                    <div className="col-lg-8 details order-2 order-lg-1">
                      <h3>Et blanditiis nemo veritatis excepturi</h3>
                      <p className="fst-italic">
                        Qui laudantium consequatur laborum sit qui ad sapiente dila
                        parde sonata raqer a videna mareta paulona marka
                      </p>
                      <p>
                        Ea ipsum voluptatem consequatur quis est. Illum error ullam
                        omnis quia et reiciendis sunt sunt est. Non aliquid
                        repellendus itaque accusamus eius et velit ipsa voluptates.
                        Optio nesciunt eaque beatae accusamus lerode pakto madirna
                        desera vafle de nideran pal
                      </p>
                    </div>
                    <div className="col-lg-4 text-center order-1 order-lg-2">
                      <img
                        src="/assets/img/departments-2.jpg"
                        alt=""
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
                <div className="tab-pane" id="departments-tab-3">
                  <div className="row">
                    <div className="col-lg-8 details order-2 order-lg-1">
                      <h3>Impedit facilis occaecati odio neque aperiam sit</h3>
                      <p className="fst-italic">
                        Eos voluptatibus quo. Odio similique illum id quidem non
                        enim fuga. Qui natus non sunt dicta dolor et. In asperiores
                        velit quaerat perferendis aut
                      </p>
                      <p>
                        Iure officiis odit rerum. Harum sequi eum illum corrupti
                        culpa veritatis quisquam. Neque necessitatibus illo rerum
                        eum ut. Commodi ipsam minima molestiae sed laboriosam a iste
                        odio. Earum odit nesciunt fugiat sit ullam. Soluta et harum
                        voluptatem optio quae
                      </p>
                    </div>
                    <div className="col-lg-4 text-center order-1 order-lg-2">
                      <img
                        src="/assets/img/departments-3.jpg"
                        alt=""
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
                <div className="tab-pane" id="departments-tab-4">
                  <div className="row">
                    <div className="col-lg-8 details order-2 order-lg-1">
                      <h3>
                        Fuga dolores inventore laboriosam ut est accusamus
                        laboriosam dolore
                      </h3>
                      <p className="fst-italic">
                        Totam aperiam accusamus. Repellat consequuntur iure voluptas
                        iure porro quis delectus
                      </p>
                      <p>
                        Eaque consequuntur consequuntur libero expedita in voluptas.
                        Nostrum ipsam necessitatibus aliquam fugiat debitis quis
                        velit. Eum ex maxime error in consequatur corporis atque.
                        Eligendi asperiores sed qui veritatis aperiam quia a laborum
                        inventore
                      </p>
                    </div>
                    <div className="col-lg-4 text-center order-1 order-lg-2">
                      <img
                        src="/assets/img/departments-4.jpg"
                        alt=""
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
                <div className="tab-pane" id="departments-tab-5">
                  <div className="row">
                    <div className="col-lg-8 details order-2 order-lg-1">
                      <h3>
                        Est eveniet ipsam sindera pad rone matrelat sando reda
                      </h3>
                      <p className="fst-italic">
                        Omnis blanditiis saepe eos autem qui sunt debitis porro
                        quia.
                      </p>
                      <p>
                        Exercitationem nostrum omnis. Ut reiciendis repudiandae
                        minus. Omnis recusandae ut non quam ut quod eius qui. Ipsum
                        quia odit vero atque qui quibusdam amet. Occaecati sed est
                        sint aut vitae molestiae voluptate vel
                      </p>
                    </div>
                    <div className="col-lg-4 text-center order-1 order-lg-2">
                      <img
                        src="/assets/img/departments-5.jpg"
                        alt=""
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Departments Section */}
      {/* Doctors Section */}
      <section id="doctors" className="doctors section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Doctors</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay={100}>
              <div className="team-member d-flex align-items-start">
                <div className="pic">
                  <img
                    src="/assets/img/doctors/doctors-1.jpg"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="member-info">
                  <h4>Walter White</h4>
                  <span>Chief Medical Officer</span>
                  <p>Explicabo voluptatem mollitia et repellat qui dolorum quasi</p>
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter-x" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                    <a href="">
                      {" "}
                      <i className="bi bi-linkedin" />{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* End Team Member */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay={200}>
              <div className="team-member d-flex align-items-start">
                <div className="pic">
                  <img
                    src="/assets/img/doctors/doctors-2.jpg"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="member-info">
                  <h4>Sarah Jhonson</h4>
                  <span>Anesthesiologist</span>
                  <p>
                    Aut maiores voluptates amet et quis praesentium qui senda para
                  </p>
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter-x" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                    <a href="">
                      {" "}
                      <i className="bi bi-linkedin" />{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* End Team Member */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay={300}>
              <div className="team-member d-flex align-items-start">
                <div className="pic">
                  <img
                    src="/assets/img/doctors/doctors-3.jpg"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="member-info">
                  <h4>William Anderson</h4>
                  <span>Cardiology</span>
                  <p>Quisquam facilis cum velit laborum corrupti fuga rerum quia</p>
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter-x" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                    <a href="">
                      {" "}
                      <i className="bi bi-linkedin" />{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* End Team Member */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay={400}>
              <div className="team-member d-flex align-items-start">
                <div className="pic">
                  <img
                    src="/assets/img/doctors/doctors-4.jpg"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="member-info">
                  <h4>Amanda Jepson</h4>
                  <span>Neurosurgeon</span>
                  <p>
                    Dolorum tempora officiis odit laborum officiis et et accusamus
                  </p>
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter-x" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                    <a href="">
                      {" "}
                      <i className="bi bi-linkedin" />{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* End Team Member */}
          </div>
        </div>
      </section>
      {/* /Doctors Section */}
      {/* Faq Section */}
      <section id="faq" className="faq section light-background">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Frequently Asked Questions</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay={100}>
              <div className="faq-container">
                <div className="faq-item faq-active">
                  <h3>Non consectetur a erat nam at lectus urna duis?</h3>
                  <div className="faq-content">
                    <p>
                      Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id
                      volutpat lacus laoreet non curabitur gravida. Venenatis lectus
                      magna fringilla urna porttitor rhoncus dolor purus non.
                    </p>
                  </div>
                  <i className="faq-toggle bi bi-chevron-right" />
                </div>
                {/* End Faq item*/}
                <div className="faq-item">
                  <h3>Feugiat scelerisque varius morbi enim nunc faucibus?</h3>
                  <div className="faq-content">
                    <p>
                      Dolor sit amet consectetur adipiscing elit pellentesque
                      habitant morbi. Id interdum velit laoreet id donec ultrices.
                      Fringilla phasellus faucibus scelerisque eleifend donec
                      pretium. Est pellentesque elit ullamcorper dignissim. Mauris
                      ultrices eros in cursus turpis massa tincidunt dui.
                    </p>
                  </div>
                  <i className="faq-toggle bi bi-chevron-right" />
                </div>
                {/* End Faq item*/}
                <div className="faq-item">
                  <h3>Dolor sit amet consectetur adipiscing elit pellentesque?</h3>
                  <div className="faq-content">
                    <p>
                      Eleifend mi in nulla posuere sollicitudin aliquam ultrices
                      sagittis orci. Faucibus pulvinar elementum integer enim. Sem
                      nulla pharetra diam sit amet nisl suscipit. Rutrum tellus
                      pellentesque eu tincidunt. Lectus urna duis convallis
                      convallis tellus. Urna molestie at elementum eu facilisis sed
                      odio morbi quis
                    </p>
                  </div>
                  <i className="faq-toggle bi bi-chevron-right" />
                </div>
                {/* End Faq item*/}
                <div className="faq-item">
                  <h3>
                    Ac odio tempor orci dapibus. Aliquam eleifend mi in nulla?
                  </h3>
                  <div className="faq-content">
                    <p>
                      Dolor sit amet consectetur adipiscing elit pellentesque
                      habitant morbi. Id interdum velit laoreet id donec ultrices.
                      Fringilla phasellus faucibus scelerisque eleifend donec
                      pretium. Est pellentesque elit ullamcorper dignissim. Mauris
                      ultrices eros in cursus turpis massa tincidunt dui.
                    </p>
                  </div>
                  <i className="faq-toggle bi bi-chevron-right" />
                </div>
                {/* End Faq item*/}
                <div className="faq-item">
                  <h3>Tempus quam pellentesque nec nam aliquam sem et tortor?</h3>
                  <div className="faq-content">
                    <p>
                      Molestie a iaculis at erat pellentesque adipiscing commodo.
                      Dignissim suspendisse in est ante in. Nunc vel risus commodo
                      viverra maecenas accumsan. Sit amet nisl suscipit adipiscing
                      bibendum est. Purus gravida quis blandit turpis cursus in
                    </p>
                  </div>
                  <i className="faq-toggle bi bi-chevron-right" />
                </div>
                {/* End Faq item*/}
                <div className="faq-item">
                  <h3>Perspiciatis quod quo quos nulla quo illum ullam?</h3>
                  <div className="faq-content">
                    <p>
                      Enim ea facilis quaerat voluptas quidem et dolorem. Quis et
                      consequatur non sed in suscipit sequi. Distinctio ipsam dolore
                      et.
                    </p>
                  </div>
                  <i className="faq-toggle bi bi-chevron-right" />
                </div>
                {/* End Faq item*/}
              </div>
            </div>
            {/* End Faq Column*/}
          </div>
        </div>
      </section>
      {/* /Faq Section */}
      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 info" data-aos="fade-up" data-aos-delay={100}>
              <h3>Testimonials</h3>
              <p>
                Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident.
              </p>
            </div>
            <div className="col-lg-7" data-aos="fade-up" data-aos-delay={200}>
              <div className="swiper init-swiper">
                <div className="swiper-wrapper">
                  <div className="swiper-slide">
                    <div className="testimonial-item">
                      <div className="d-flex">
                        <img
                          src="/assets/img/testimonials/testimonials-1.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Saul Goodman</h3>
                          <h4>Ceo &amp; Founder</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        <span>
                          Proin iaculis purus consequat sem cure digni ssim donec
                          porttitora entum suscipit rhoncus. Accusantium quam,
                          ultricies eget id, aliquam eget nibh et. Maecen aliquam,
                          risus at semper.
                        </span>
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                  {/* End testimonial item */}
                  <div className="swiper-slide">
                    <div className="testimonial-item">
                      <div className="d-flex">
                        <img
                          src="/assets/img/testimonials/testimonials-2.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Sara Wilsson</h3>
                          <h4>Designer</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        <span>
                          Export tempor illum tamen malis malis eram quae irure esse
                          labore quem cillum quid cillum eram malis quorum velit
                          fore eram velit sunt aliqua noster fugiat irure amet legam
                          anim culpa.
                        </span>
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                  {/* End testimonial item */}
                  <div className="swiper-slide">
                    <div className="testimonial-item">
                      <div className="d-flex">
                        <img
                          src="/assets/img/testimonials/testimonials-3.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Jena Karlis</h3>
                          <h4>Store Owner</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        <span>
                          Enim nisi quem export duis labore cillum quae magna enim
                          sint quorum nulla quem veniam duis minim tempor labore
                          quem eram duis noster aute amet eram fore quis sint minim.
                        </span>
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                  {/* End testimonial item */}
                  <div className="swiper-slide">
                    <div className="testimonial-item">
                      <div className="d-flex">
                        <img
                          src="/assets/img/testimonials/testimonials-4.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Matt Brandon</h3>
                          <h4>Freelancer</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        <span>
                          Fugiat enim eram quae cillum dolore dolor amet nulla culpa
                          multos export minim fugiat minim velit minim dolor enim
                          duis veniam ipsum anim magna sunt elit fore quem dolore
                          labore illum veniam.
                        </span>
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                  {/* End testimonial item */}
                  <div className="swiper-slide">
                    <div className="testimonial-item">
                      <div className="d-flex">
                        <img
                          src="/assets/img/testimonials/testimonials-5.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>John Larson</h3>
                          <h4>Entrepreneur</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        <span>
                          Quis quorum aliqua sint quem legam fore sunt eram irure
                          aliqua veniam tempor noster veniam enim culpa labore duis
                          sunt culpa nulla illum cillum fugiat legam esse veniam
                          culpa fore nisi cillum quid.
                        </span>
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                  {/* End testimonial item */}
                </div>
                <div className="swiper-pagination" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Testimonials Section */}
      {/* Gallery Section */}
      <section id="gallery" className="gallery section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Gallery</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container-fluid" data-aos="fade-up" data-aos-delay={100}>
          <div className="row g-0">
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-1.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-1.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-2.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-2.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-3.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-3.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-4.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-4.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-5.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-5.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-6.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-6.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-7.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-7.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
            <div className="col-lg-3 col-md-4">
              <div className="gallery-item">
                <a
                  href="/assets/img/gallery/gallery-8.jpg"
                  className="glightbox"
                  data-gallery="images-gallery"
                >
                  <img
                    src="/assets/img/gallery/gallery-8.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </a>
              </div>
            </div>
            {/* End Gallery Item */}
          </div>
        </div>
      </section>
      {/* /Gallery Section */}
      {/* Contact Section */}
      <section id="contact" className="contact section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Contact</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="mb-5" data-aos="fade-up" data-aos-delay={200}>
          <iframe
            style={{ border: 0, width: "100%", height: 270 }}
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus"
            frameBorder={0}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        {/* End Google Maps */}
        <div className="container" data-aos="fade-up" data-aos-delay={100}>
          <div className="row gy-4">
            <div className="col-lg-4">
              <div
                className="info-item d-flex"
                data-aos="fade-up"
                data-aos-delay={300}
              >
                <i className="bi bi-geo-alt flex-shrink-0" />
                <div>
                  <h3>Location</h3>
                  <p>A108 Adam Street, New York, NY 535022</p>
                </div>
              </div>
              {/* End Info Item */}
              <div
                className="info-item d-flex"
                data-aos="fade-up"
                data-aos-delay={400}
              >
                <i className="bi bi-telephone flex-shrink-0" />
                <div>
                  <h3>Call Us</h3>
                  <p>+1 5589 55488 55</p>
                </div>
              </div>
              {/* End Info Item */}
              <div
                className="info-item d-flex"
                data-aos="fade-up"
                data-aos-delay={500}
              >
                <i className="bi bi-envelope flex-shrink-0" />
                <div>
                  <h3>Email Us</h3>
                  <p>info@example.com</p>
                </div>
              </div>
              {/* End Info Item */}
            </div>
            <div className="col-lg-8">
              <form
                onSubmit={FormikContactUs.handleSubmit}
                className="php-email-form"
              >
                <div className="row gy-4">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Your Name"
                      id="name"
                      value={FormikContactUs.values.name}
                      onChange={FormikContactUs.handleChange}
                      onBlur={FormikContactUs.handleBlur}
                    />
                    <span className="text-danger">{FormikContactUs.touched.name && FormikContactUs.errors?.name}</span>
                  </div>
                  <div className="col-md-6 ">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Your Email"
                      id="email"
                      value={FormikContactUs.values.email}
                      onChange={FormikContactUs.handleChange}
                      onBlur={FormikContactUs.handleBlur}
                    />
                    <span className="text-danger">{FormikContactUs.touched.email && FormikContactUs.errors?.email}</span>
                  </div>
                  <div className="col-md-12">
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      placeholder="Subject"
                      id="subject"
                      value={FormikContactUs.values.subject}
                      onChange={FormikContactUs.handleChange}
                      onBlur={FormikContactUs.handleBlur}
                    />
                    <span className="text-danger">{FormikContactUs.touched.subject && FormikContactUs.errors?.subject}</span>
                  </div>
                  <div className="col-md-12">
                    <textarea
                      className="form-control"
                      name="message"
                      rows={6}
                      placeholder="Message"
                      id="message"
                      value={FormikContactUs.values.message}
                      onChange={FormikContactUs.handleChange}
                      onBlur={FormikContactUs.handleBlur}
                    />
                    <span className="text-danger">{FormikContactUs.touched.message && FormikContactUs.errors?.message}</span>
                  </div>
                  <div className="col-md-12 text-center">
                    <div className="error-message" />
                    <div className="sent-message">
                      Your message has been sent. Thank you!
                    </div>
                    <button type="submit">{msgPending ? "pending" : (msgFulfilled ? " Send Message Success" : "Send Message ")}</button>
                  </div>
                </div>
              </form>
            </div>
            {/* End Contact Form */}
          </div>
        </div>
      </section>
      {/* /Contact Section */}
    </>
  )
}

export default App
