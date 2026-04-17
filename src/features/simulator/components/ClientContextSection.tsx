import {
  Flex,
  FlexItem,
  FormFieldGroup,
  FormFieldGroupHeader,
  FormGroup,
  Radio,
  TextInput,
} from "@patternfly/react-core";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import type { NamedOption } from "./types";

interface Props {
  platform: string;
  platforms: string[];
  onPlatformChange: (v: string) => void;

  trustedNetwork: string;
  trustedNetworks: NamedOption[];
  onTrustedNetworkChange: (v: string) => void;
}

export function ClientContextSection({
  platform,
  platforms,
  onPlatformChange,
  trustedNetwork,
  trustedNetworks,
  onTrustedNetworkChange,
}: Props) {
  return (
    <FormFieldGroup
      header={
        <FormFieldGroupHeader
          titleText={{ text: "Client Context", id: "fg-client" }}
        />
      }
    >
      <FormGroup label="Client Type" fieldId="clientType">
        <TextInput id="clientType" value="Client Connector" readOnlyVariant="plain" isDisabled />
      </FormGroup>

      <FormGroup label="Platform" fieldId="platform" role="radiogroup">
        <Flex spaceItems={{ default: "spaceItemsMd" }} flexWrap={{ default: "wrap" }}>
          {platforms.map((p) => (
            <FlexItem key={p}>
              <Radio
                id={`platform-${p}`}
                name="platform"
                label={p}
                value={p}
                isChecked={platform === p}
                onChange={() => onPlatformChange(p)}
              />
            </FlexItem>
          ))}
        </Flex>
      </FormGroup>

      <FormGroup label="Trusted Network" fieldId="trustedNetwork">
        <SearchSelect
          value={trustedNetwork}
          options={trustedNetworks}
          onChange={onTrustedNetworkChange}
          placeholder="Select trusted network..."
        />
      </FormGroup>
    </FormFieldGroup>
  );
}
