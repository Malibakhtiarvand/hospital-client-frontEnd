import { useEffect } from "react"
import { useSelector } from "react-redux"
import * as Yup from "yup"
import { validateEmailError, validateMaxLengthError, validateMinLengthError, validateRequiredError } from "../utilities/validateErrors"
import { useFormik } from "formik"
import { getCookie } from "../utilities/redux/slices/rtkQueryPatients"


export default function Contact() {
    const { msgPending, msgFulfilled } = useSelector(state => state.sliceReducer)

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
    )
};
