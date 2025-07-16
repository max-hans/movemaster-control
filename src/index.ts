import { SerialPort } from "serialport";
import Robot from "./Robot";
import { delay } from "./utils";

const robot = new Robot();

const start = async () => {
  await robot.connect("/dev/tty.usbserial-141430");
  console.log("Robot connected and ready to receive data.");
  await delay(1000);

  const pos = await robot.getPosition();
  console.log("Current position:", pos);
  await delay(1000);
  await robot.setToolLength(107);
  /* await robot.setGripper(true);
   */
  await delay(1000);
  while (true) {
    await robot.moveTo(0, 520, 250, -10, 0);
    await delay(1000);
    await robot.moveTo(0, 520, 250, 10, 0);
    await delay(1000);
  }
  /* await robot.moveTo(0, 200, 300, 0, 0);
  await delay(2000); */
  /* await robot.moveTo(0, 560, 280, 0, 0);
  await delay(2000);
  await robot.moveTo(0, 560, 300, 0, 0);
  await delay(2000); */
  //await robot.setGripper(false);
  await robot.disconnect();
};

start();
