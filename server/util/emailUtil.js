const nodemailer = require('nodemailer')
const common = require('@util/common')

const sendInvite = async (emailAddr, name, friendId)  => {
  // convert small logo to base64
  const logoBase64 = `data:image/jpeg;base64,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`
  
  const emailHtml = `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding&display=swap" rel="stylesheet">
      <title>Skidoodle invite email</title>
      <style>
        /* -------------------------------------
            GLOBAL RESETS
        ------------------------------------- */
        
        /*All the styling goes here*/
        
        img {
          border: none;
          -ms-interpolation-mode: bicubic;
          max-width: 100%; 
        }

        body {
          background-color: #f6f6f6;
          font-family: 'Nanum Gothic Coding', monospace;
          -webkit-font-smoothing: antialiased;
          font-size: 14px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%; 
        }

        table {
          border-collapse: separate;
          width: 100%; }
          table td {
            font-family: 'Nanum Gothic Coding', monospace;
            font-size: 14px;
            vertical-align: top; 
        }

        /* -------------------------------------
            BODY & CONTAINER
        ------------------------------------- */

        .body {
          background-color: #f6f6f6;
          width: 100%; 
        }

        /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
        .container {
          display: block;
          margin: 0 auto !important;
          /* makes it centered */
          max-width: 580px;
          padding: 10px;
          width: 580px; 
        }

        /* This should also be a block element, so that it will fill 100% of the .container */
        .content {
          box-sizing: border-box;
          display: block;
          margin: 0 auto;
          max-width: 580px;
          padding: 10px; 
        }

        /* -------------------------------------
            HEADER, FOOTER, MAIN
        ------------------------------------- */
        .main {
          background: #ffffff;
          border-radius: 3px;
          width: 100%; 
        }

        .wrapper {
          box-sizing: border-box;
          padding: 20px; 
        }

        .content-block {
          padding-bottom: 10px;
          padding-top: 10px;
        }

        .footer {
          clear: both;
          margin-top: 10px;
          text-align: center;
          width: 100%; 
        }
          .footer td,
          .footer p,
          .footer span,
          .footer a {
            color: #999999;
            font-size: 12px;
            text-align: center; 
        }

        /* -------------------------------------
            TYPOGRAPHY
        ------------------------------------- */
        h1,
        h2,
        h3,
        h4 {
          color: #000000;
          font-family: 'Nanum Gothic Coding', monospace;
          font-weight: 400;
          line-height: 1.4;
          margin: 0;
          margin-bottom: 30px; 
        }

        h1 {
          font-size: 35px;
          font-weight: 300;
          text-align: center;
          text-transform: capitalize; 
        }

        p,
        ul,
        ol {
          font-family: 'Nanum Gothic Coding', monospace;
          font-size: 14px;
          font-weight: normal;
          margin: 0;
          margin-bottom: 15px; 
        }
          p li,
          ul li,
          ol li {
            list-style-position: inside;
            margin-left: 5px; 
        }

        a {
          color: #3498db;
          text-decoration: underline; 
        }

        /* -------------------------------------
            BUTTONS
        ------------------------------------- */
        .btn {
          box-sizing: border-box;
          width: 100%; }
          .btn > tbody > tr > td {
            padding-bottom: 15px; }
          .btn table {
            width: auto; 
        }
          .btn table td {
            background-color: #ffffff;
            border-radius: 5px;
            text-align: center; 
        }
          .btn a {
            background-color: #ffffff;
            border: solid 1px #3498db;
            border-radius: 5px;
            box-sizing: border-box;
            color: #3498db;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            padding: 12px 25px;
            text-decoration: none;
            text-transform: capitalize; 
        }

        .btn-primary table td {
          background-color: #3498db; 
        }

        .btn-primary a {
          background-color: #3498db;
          border-color: #3498db;
          color: #ffffff; 
        }

        /* -------------------------------------
            OTHER STYLES THAT MIGHT BE USEFUL
        ------------------------------------- */
        .last {
          margin-bottom: 0; 
        }

        .first {
          margin-top: 0; 
        }

        .align-center {
          text-align: center; 
        }

        .align-right {
          text-align: right; 
        }

        .align-left {
          text-align: left; 
        }

        .clear {
          clear: both; 
        }

        .mt0 {
          margin-top: 0; 
        }

        .mb0 {
          margin-bottom: 0; 
        }

        .preheader {
          color: transparent;
          display: none;
          height: 0;
          max-height: 0;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          visibility: hidden;
          width: 0; 
        }

        .powered-by a {
          text-decoration: none; 
        }

        hr {
          border: 0;
          border-bottom: 1px solid #f6f6f6;
          margin: 20px 0; 
        }

        /* -------------------------------------
            RESPONSIVE AND MOBILE FRIENDLY STYLES
        ------------------------------------- */
        @media only screen and (max-width: 620px) {
          table[class=body] h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important; 
          }
          table[class=body] p,
          table[class=body] ul,
          table[class=body] ol,
          table[class=body] td,
          table[class=body] span,
          table[class=body] a {
            font-size: 16px !important; 
          }
          table[class=body] .wrapper,
          table[class=body] .article {
            padding: 10px !important; 
          }
          table[class=body] .content {
            padding: 0 !important; 
          }
          table[class=body] .container {
            padding: 0 !important;
            width: 100% !important; 
          }
          table[class=body] .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important; 
          }
          table[class=body] .btn table {
            width: 100% !important; 
          }
          table[class=body] .btn a {
            width: 100% !important; 
          }
          table[class=body] .img-responsive {
            height: auto !important;
            max-width: 100% !important;
            width: auto !important; 
          }
        }

        /* -------------------------------------
            PRESERVE THESE STYLES IN THE HEAD
        ------------------------------------- */
        @media all {
          .ExternalClass {
            width: 100%; 
          }
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%; 
          }
          .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important; 
          }
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }
          .btn-primary table td:hover {
            background-color: #34495e !important; 
          }
          .btn-primary a:hover {
            background-color: #34495e !important;
            border-color: #34495e !important; 
          } 
        }

      </style>
    </head>
    <body class="">
      <span class="preheader">${name} has invited you to play skidoodle!</span>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">

              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" class="main">

                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <img src="${logoBase64}" alt="skidoodle logo" width="100%" />
                          <p><b color="tomato">${name}<b> has invited you to play skidoodle! Follow the link below to get started.</p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                            <tbody>
                              <tr>
                                <td align="left">
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                      <tr>
                                        <td> <a href="${common.BASE_URL}/signup?email=${encodeURIComponent(emailAddr)}&friendId=${friendId}" target="_blank">Let's play</a> </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              <!-- END MAIN CONTENT AREA -->
              </table>
              <!-- END CENTERED WHITE CONTAINER -->

              <!-- START FOOTER
              <div class="footer">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-block">
                      <span class="apple-link">Company Inc, 3 Abbey Road, San Francisco CA 94102</span>
                      <br> Don't like these emails? <a href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>.
                    </td>
                  </tr>
                  <tr>
                    <td class="content-block powered-by">
                      Powered by <a href="http://htmlemail.io">HTMLemail</a>.
                    </td>
                  </tr>
                </table>
              </div>
              END FOOTER -->

            </div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>
  `
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'skidoodle.mail@gmail.com',
      pass: common.EMAIL_PWORD
    }
  })

  const message = {
    from: 'skidoodle.mail@gmail.com',
    to: emailAddr,
    subject: `Skidoodle Invitation`,
    html: emailHtml
  }

  const info = await transporter.sendMail(message)
  return info.response

}

module.exports = { sendInvite }