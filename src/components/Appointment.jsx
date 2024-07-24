import { useDispatch, useSelector } from "react-redux"
import { useAddPatientMutation, useGetDataQuery, useLazyCancelVisitQuery } from "../utilities/redux/slices/rtkQueryPatients"
import * as Yup from "yup"
import { useFormik } from "formik"
import axios from "axios"
import { useEffect, useMemo } from "react"
import { validateEmailError, validateFitLengthError, validateMaxLengthError, validateMinLengthError, validateRequiredError } from "../utilities/validateErrors"
import { changeLoadDoctors, changeLoadTimes, getDoctors, getTimes } from "../utilities/redux/slices/patientSlice"


export default function Appointment() {
    const { departments, doctors, times, loadDoctors, loadTimes } = useSelector(state => state.sliceReducer)
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

    return (
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
    )
};
