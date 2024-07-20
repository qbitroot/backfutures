import { configureStore } from "@reduxjs/toolkit";
import simulationReducer from "@/redux/simulationReducer";

export default configureStore({
  reducer: { simulation: simulationReducer },
});
