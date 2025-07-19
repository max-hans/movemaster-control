import NavbarButtons from "./components/NavbarButtons";
import GripperPanel from "./panels/Gripper";
import JsonPositionPanel from "./panels/JsonPosition";
import PositionPanel from "./panels/Position";
import StatusPanel from "./panels/Status";

function App() {
	return (
		<>
			<header className="w-full border-b flex flex-row items-center p-4 px-8">
				<p className="text-2xl font-bold">Robot control</p>
				<div className="flex-1" />
				<NavbarButtons />
			</header>

			<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
				<StatusPanel />
				<PositionPanel />
				<GripperPanel />
				<JsonPositionPanel />
			</main>
		</>
	);
}

export default App;
