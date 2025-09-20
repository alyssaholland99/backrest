import {
  Form,
  Modal,
  Input,
  Button,
} from "antd";
import React, { useState } from "react";
import { useShowModal } from "../components/ModalManager";
import {
  RepoSchema,
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
      let repoFormData = await validateForm(form);
      const parsedJson = JSON.parse(repoFormData.planJson);
      const repo = fromJson(RepoSchema, parsedJson);
      const { AddRepoModal } = await import("./AddRepoModal");
      showModal(<AddRepoModal template={null} templateClone={repo} />);
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
        title={"Import repository configuration from JSON"}
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
          If you have an repository config in JSON format, add it here. 
          If you want to create a new repository config from scratch. Use the 'Add Repo' button.
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
            label="Repository JSON"
            initialValue={""}
            validateTrigger={["onChange", "onBlur"]}
            tooltip="Paste your Backrest repository config here"
            rules={[
              {
                required: true,
                message: "Please paste your repository JSON",
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
