import axios from "axios";
import { useState } from "react";
import { useInterval } from "react-use";

const useSerialports = (shouldGetPorts: boolean) => {
	const [serialports, setSerialports] = useState<string[]>([]);

	useInterval(
		async () => {
			try {
				const response = await axios.get("/serialports");
				setSerialports(response.data);
			} catch (error) {
				console.error("Error fetching serial ports:", error);
			}
		},
		shouldGetPorts ? 1000 : null,
	);

	return serialports;
};
export default useSerialports;
