import { hex } from "@scure/base";
import * as btc from "@scure/btc-signer";
import { getPsbtPreview } from "~/common/lib/psbt";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type { MessageSignPsbt } from "~/types";

const passwordMock = jest.fn;

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    mnemonic: btcFixture.mnemnoic,
  }),
  getConnector: jest.fn(),
  settings: {
    bitcoinNetwork: "regtest",
  },
};

state.getState = jest.fn().mockReturnValue(mockState);

jest.mock("~/common/lib/crypto", () => {
  return {
    decryptData: jest.fn((encrypted, _password) => {
      return encrypted;
    }),
  };
});

beforeEach(async () => {
  // fill the DB first
});

afterEach(() => {
  jest.clearAllMocks();
});

async function sendPsbtMessage(psbt: string, derivationPath?: string) {
  const message: MessageSignPsbt = {
    application: "LBE",
    prompt: true,
    action: "signPsbt",
    origin: {
      internal: true,
    },
    args: {
      psbt,
    },
  };

  return await signPsbt(message);
}

describe("signPsbt", () => {
  test("1 input, taproot, regtest", async () => {
    const result = await sendPsbtMessage(btcFixture.regtestTaprootPsbt);
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).not.toBe(undefined);
    expect(result.data?.signed).not.toBe(undefined);
    expect(result.error).toBe(undefined);

    const checkTx = btc.Transaction.fromRaw(hex.decode(result.data.signed));
    expect(checkTx.isFinal).toBe(true);
    expect(result.data?.signed).toBe(btcFixture.regtestTaprootSignedPsbt);
  });
});

describe("signPsbt input validation", () => {
  test("invalid psbt", async () => {
    const result = await sendPsbtMessage("test");
    expect(result.error).not.toBe(null);
  });
});

describe("decode psbt", () => {
  test("get taproot transaction preview", async () => {
    const preview = getPsbtPreview(btcFixture.regtestTaprootPsbt, "regtest");
    expect(preview.inputs.length).toBe(1);
    expect(preview.inputs[0].address).toBe(
      "bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg"
    );
    expect(preview.inputs[0].amount).toBe(10_000_000);
    expect(preview.outputs.length).toBe(2);

    expect(preview.outputs[0].address).toBe(
      "bcrt1p6uav7en8k7zsumsqugdmg5j6930zmzy4dg7jcddshsr0fvxlqx7qnc7l22"
    );
    expect(preview.outputs[0].amount).toBe(4_999_845);
    expect(preview.outputs[1].address).toBe(
      "bcrt1p90h6z3p36n9hrzy7580h5l429uwchyg8uc9sz4jwzhdtuhqdl5eqkcyx0f"
    );
    expect(preview.outputs[1].amount).toBe(5_000_000);
  });
});