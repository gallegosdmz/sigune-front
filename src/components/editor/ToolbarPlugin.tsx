import React from "react";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button, Space } from "antd";

export const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const format = (style: string) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, style as any);
  };

  const insertList = (ordered: boolean) => {
    editor.dispatchCommand(
      ordered ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
      undefined
    );
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <Space wrap>
        <Button size="small" onClick={() => format("bold")}>Negrita</Button>
        <Button size="small" onClick={() => format("italic")}>Cursiva</Button>
        <Button size="small" onClick={() => format("underline")}>Subrayado</Button>
        <Button size="small" onClick={() => insertList(false)}>Lista</Button>
        <Button size="small" onClick={() => insertList(true)}>Lista Ordenada</Button>
      </Space>
    </div>
  );
};
