import { Button, Modal } from "antd";
import { useDispatch } from "react-redux";
import { resetBalance } from "@/redux/simulationReducer";

function LiquidationButton() {
  const dispatch = useDispatch();
  return (
    <Button onClick={() => dispatch(resetBalance())} danger type="primary">
      Sell furniture & try again
    </Button>
  );
}

export default function LiquidationModal({
  isLiquidated,
}: {
  isLiquidated: boolean;
}) {
  return (
    <Modal
      open={isLiquidated}
      title="Futures Liquidation Call"
      footer={[<LiquidationButton key={0} />]}
      closable={false}
    >
      <p>
        Your account balance has been liquidated as a result of a severe skill
        issue.
      </p>
      <p className="text-center text-gray-400 select-none">
        <i>A naked man fears no pickpocket.</i>
      </p>
    </Modal>
  );
}
