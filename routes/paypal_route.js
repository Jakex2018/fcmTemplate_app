const express = require("express");
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");

// Configurar entorno sandbox
const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

router.post("/create-paypal-order", async (req, res) => {
    const { amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount || "3.00",
                },
            },
        ],
        application_context: {
            return_url: "https://yourdomain.com/paypal/success",
            cancel_url: "https://yourdomain.com/paypal/cancel",
            brand_name: "TemplateApp",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
        },
    });

    try {
        const order = await client.execute(request);
        res.status(200).json({
            id: order.result.id,
            links: order.result.links,
        });
    } catch (error) {
        console.error("PayPal error:", error);
        res.status(500).json({ error: "Error creando orden de PayPal" });
    }
});



router.post("/capture-paypal-order", async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: "orderId es requerido." });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        res.status(200).json({ success: true, data: capture.result });
    } catch (error) {
        console.error("Error capturando orden de PayPal:", error);
        res.status(500).json({ error: "No se pudo capturar la orden de PayPal" });
    }
});


