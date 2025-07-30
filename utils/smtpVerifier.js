// import dns from "dns/promises";
// import net from "net";
// import disposableDomains from "../disposable_email_blocklist.json" assert { type: "json" };

// function isDisposableEmail(email) {
//   const domain = email.split("@")[1].toLowerCase();
//   return disposableDomains.includes(domain);
// }

// export async function verifySMTP(email) {
//   if (isDisposableEmail(email)) {
//     return {
//       valid: false,
//       reason: "Disposable email address detected",
//       mx_domain: null,
//       mx_record: null,
//       catch_all: null,
//       disposable: true,
//     };
//   }
//   const domain = email.split("@")[1];
//   let mxRecords;

//   try {
//     mxRecords = await dns.resolveMx(domain);
//     if (!mxRecords.length) throw new Error("No MX records");
//   } catch {
//     return {
//       valid: false,
//       reason: "Invalid or unreachable domain",
//       mx_domain: null,
//       mx_record: null,
//       catch_all: null,
//       disposable: false,
//     };
//   }

//   const sortedMx = mxRecords.sort((a, b) => a.priority - b.priority);
//   const mxHost = sortedMx[0].exchange;


//   return new Promise((resolve) => {
//     const socket = net.createConnection(25, mxHost);
//     let stage = 0;
//     let responses = [];

//     const randomEmail = `randomtest12345${Date.now()}@${domain}`;

//     socket.setEncoding("ascii");
//     socket.setTimeout(5000);

//     socket.on("data", (data) => {
//       responses.push(data);

//       if (stage === 0 && /220/.test(data)) {
//         socket.write(`HELO yourdomain.com\r\n`);
//         stage++;
//       } else if (stage === 1 && /250/.test(data)) {
//         socket.write(`MAIL FROM:<you@yourdomain.com>\r\n`);
//         stage++;
//       } else if (stage === 2 && /250/.test(data)) {
//         socket.write(`RCPT TO:<${email}>\r\n`);
//         stage++;
//       } else if (stage === 3) {
//         if (/250/.test(data)) {
//           socket.write(`RCPT TO:<${randomEmail}>\r\n`);
//           stage++;
//         } else {
//           resolve({
//             valid: false,
//             reason: "SMTP: Real email rejected",
//             mx_domain: mxHost,
//             mx_record: sortedMx[0],
//             catch_all: false,
//             disposable: false,
//           });
//           socket.end("QUIT\r\n");
//         }
//       } else if (stage === 4) {
//         const catchAll = /250/.test(data);
//         resolve({
//           valid: true,
//           reason: "SMTP: Email accepted by server",
//           mx_domain: mxHost,
//           mx_record: sortedMx[0],
//           catch_all: catchAll,
//           disposable: false,
//         });
//         socket.end("QUIT\r\n");
//       }
//     });

//     socket.on("error", () => {
//       resolve({
//         valid: false,
//         reason: "SMTP connection error",
//         mx_domain: mxHost,
//         mx_record: sortedMx[0],
//         catch_all: null,
//         disposable: false,
//       });
//     });

//     socket.on("timeout", () => {
//       socket.destroy();
//       resolve({
//         valid: false,
//         reason: "SMTP timeout",
//         mx_domain: mxHost,
//         mx_record: sortedMx[0],
//         catch_all: null,
//         disposable: false,
//       });
//     });
//   });
// }





import dns from "dns/promises";
import net from "net";
import fs from "fs";

// ✅ Load JSON without `assert`
const disposableDomains = JSON.parse(
  fs.readFileSync(
    new URL("../disposable_email_blocklist.json", import.meta.url),
    "utf-8"
  )
);

function isDisposableEmail(email) {
  const domain = email.split("@")[1].toLowerCase();
  return disposableDomains.includes(domain);
}

export async function verifySMTP(email) {
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      reason: "Disposable email address detected",
      mx_domain: null,
      mx_record: null,
      catch_all: null,
      disposable: true,
    };
  }

  const domain = email.split("@")[1];
  let mxRecords;

  try {
    mxRecords = await dns.resolveMx(domain);
    if (!mxRecords.length) throw new Error("No MX records");
  } catch {
    return {
      valid: false,
      reason: "Invalid or unreachable domain",
      mx_domain: null,
      mx_record: null,
      catch_all: null,
      disposable: false,
    };
  }

  const sortedMx = mxRecords.sort((a, b) => a.priority - b.priority);
  const mxHost = sortedMx[0].exchange;

  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let stage = 0;
    let responses = [];

    const randomEmail = `randomtest12345${Date.now()}@${domain}`;

    socket.setEncoding("ascii");
    socket.setTimeout(5000);

    socket.on("data", (data) => {
      responses.push(data);

      if (stage === 0 && /220/.test(data)) {
        socket.write(`HELO yourdomain.com\r\n`);
        stage++;
      } else if (stage === 1 && /250/.test(data)) {
        socket.write(`MAIL FROM:<you@yourdomain.com>\r\n`);
        stage++;
      } else if (stage === 2 && /250/.test(data)) {
        socket.write(`RCPT TO:<${email}>\r\n`);
        stage++;
      } else if (stage === 3) {
        if (/250/.test(data)) {
          socket.write(`RCPT TO:<${randomEmail}>\r\n`);
          stage++;
        } else {
          resolve({
            valid: false,
            reason: "SMTP: Real email rejected",
            mx_domain: mxHost,
            mx_record: sortedMx[0],
            catch_all: false,
            disposable: false,
          });
          socket.end("QUIT\r\n");
        }
      } else if (stage === 4) {
        const catchAll = /250/.test(data);
        resolve({
          valid: true,
          reason: "SMTP: Email accepted by server",
          mx_domain: mxHost,
          mx_record: sortedMx[0],
          catch_all: catchAll,
          disposable: false,
        });
        socket.end("QUIT\r\n");
      }
    });

    socket.on("error", () => {
      resolve({
        valid: false,
        reason: "SMTP connection error",
        mx_domain: mxHost,
        mx_record: sortedMx[0],
        catch_all: null,
        disposable: false,
      });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        valid: false,
        reason: "SMTP timeout",
        mx_domain: mxHost,
        mx_record: sortedMx[0],
        catch_all: null,
        disposable: false,
      });
    });
  });
}
