import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })
    console.log(transport)

    const mailoptions = {
        from: process.env.SMTP_MAIL,
        to: "suparnakundu93@gmail.com",
        subject: options.subject,
        text: options.text
    }
    console.log(mailoptions)

    await transport.sendMail(mailoptions)
}
export default sendEmail

//need to resolve it later vid 3:14:25