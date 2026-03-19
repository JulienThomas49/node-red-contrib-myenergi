module.exports = function (RED) {
    const { EddiBoost } = require("myenergi-api");

    function SetEddiBoost(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        const myenergi = this.server.myenergi;

        this.on("input", async (msg) => {
            if (myenergi == null) {
                const text = "API Error, check credentials";
                this.status({ text, fill: "red" });
                return this.error(text);
            }

            //setEddiBoost(serialNo: string, boost: EddiBoost, minutes = 0)

            const boostMode = EddiBoost[msg.payload.boost];
            if (!boostMode) {
                const text = `You must set msg.payload.boost to one of [CancelHeater1, CancelHeater2, CancelRelay1, CancelRelay2, ManualHeater1, ManualHeater2, ManualRelay1, ManualRelay2].`;
                this.status({ text, fill: "red" });
                return this.error(text);
            }

            const minutes = msg.payload.minutes || 99;

            let serial = msg.payload.serial;
            if (!serial) {
                const eddiAll = await myenergi.getStatusEddiAll();
                serial = eddiAll[0].sno;
            }

            const payload = await myenergi.setEddiBoost(+serial, boostMode, +minutes);
            if (payload?.status !== 0) {
                this.status({
                    text: `Boost failed - status [${payload?.status}] text [${payload?.statustext}]`,
                    fill: "red",
                });
            } else {
                this.status({
                    text: `Boost mode set to [${msg.payload.boostMode}]`,
                    fill: "green",
                });
            }

            return this.send({ payload });
        });
    }

    RED.nodes.registerType("setEddiBoost", SetEddiBoost);
};
