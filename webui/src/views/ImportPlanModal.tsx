import {
  Form,
  Modal,
  Input,
  Button,
} from "antd";
import React, { useState } from "react";
import { useShowModal } from "../components/ModalManager";
import {
  PlanSchema,
} from "../../gen/ts/v1/config_pb";
import { formatErrorAlert, useAlertApi } from "../components/Alerts";
import { validateForm } from "../lib/formutil";
import { SpinButton } from "../components/SpinButton";
import { fromJson } from "@bufbuild/protobuf";

export const ImportPlanModal = () => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showModal = useShowModal();
  const alertsApi = useAlertApi()!;
  const [form] = Form.useForm();

  const handleOk = async () => {
    setConfirmLoading(true);

    try {
      let planFormData = await validateForm(form);
      const parsedJson = JSON.parse(planFormData.planJson);
      const plan = fromJson(PlanSchema, parsedJson);
      const { AddPlanModal } = await import("./AddPlanModal");
      showModal(<AddPlanModal template={null} templateClone={plan} />);
    } catch (e: any) {
      alertsApi.error(formatErrorAlert(e, "Operation error: "), 15);
      console.error(e);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    showModal(null);
  };

  return (
    <>
      <Modal
        open={true}
        onCancel={handleCancel}
        title={"Import plan from JSON"}
        width="60vw"
        footer={[
          <Button loading={confirmLoading} key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <SpinButton key="submit" type="primary" onClickAsync={handleOk}>
            Submit
          </SpinButton>,
        ]}
        maskClosable={false}
      >
        <p>
          If you have an existing plan in JSON format, add it here. 
          If you want to create a new plan from scratch. Use the 'Add Plan' button.
        </p>
        <br />
        <Form
          autoComplete="off"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          disabled={confirmLoading}
        >
          {/* Plan.json */}
          <Form.Item
            hasFeedback
            name="planJson"
            label="Plan JSON"
            initialValue={""}
            validateTrigger={["onChange", "onBlur"]}
            tooltip="Paste your Backrest plan config here"
            rules={[
              {
                required: true,
                message: "Please paste your plan JSON",
              },
            ]}
          >
            <Input.TextArea
              placeholder={"{}"}
              rows={20}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
