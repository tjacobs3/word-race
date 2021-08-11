import { useState } from "react";
import { FormControl } from "react-bootstrap";

type Props = {
  placeholder: string;
  onEnterPressed: (text: string) => void;
};

export default function TextInput({ placeholder, onEnterPressed }: Props) {
  const [text, setText] = useState('');

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      onEnterPressed(text);
      setText('');
    }
  }

  return (
    <FormControl
      type="text"
      placeholder={placeholder}
      value={text}
      onChange={e => setText(e.target.value)}
      onKeyPress={handleKeyPress}
    />
  );
}
