import Robot from "../Robot";
import { delay } from "../utils";

const robot = new Robot();

const toolOffset = 62;

const start = async () => {
	await robot.connect("/dev/tty.usbserial-145430");
	console.log("Robot connected and ready to receive data.");
	await delay(1000);

	const pos = await robot.getPosition();
	console.log("Current position:", pos);
	await delay(1000);
	await robot.setToolLength(100);

	while (true) {
		const basePosition = {
			x: 0,
			y: 500,
			z: 300,
			p: 0,
			r: 0,
		};

		const positions = [basePosition];

		await robot.moveContinuous(positions);
		await delay(2000);
	}
	/* while (true) {
    await robot.moveTo(0, 500, 300 - toolOffset * 2, 20, -180, 0);
    await delay(1500);
    await robot.moveTo(toolOffset, 500, 300 - toolOffset, 20, -90, 0);
    await delay(1500);
    await robot.moveTo(0, 500, 300, 0, 0, 0);
    await delay(1500);
    await robot.moveTo(-toolOffset, 500, 300 - toolOffset, 20, 90, 0);
    await delay(1500);
  } */

	await robot.disconnect();
};

start();
