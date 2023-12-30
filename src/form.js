import React, { useState, useEffect } from "react";
import FormRenderer from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import "./form.css";

const Formm = () => {
  const [uiSchema, setUiSchema] = useState("");
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Fetch the ui schema when component mounts
  useEffect(() => {
    try {
      const uiSchemaObj = JSON.parse(uiSchema);
      const jsonSchema = addJsonSchema(uiSchemaObj);

      setResult(jsonSchema);
    } catch (error) {
      console.error("Error parsing UI Schema", error);
    }
  }, [uiSchema]);

  // Adds JSON schema to UI schema
  const addJsonSchema = (uiSchemaObj) => {
    const jsonSchema = {
      type: "object",
      properties: {},
    };
    uiSchemaObj.forEach((uiField) => {
      const jsonField = addJsonField(uiField);
      jsonSchema.properties[uiField.jsonKey] = jsonField;
    });

    return jsonSchema;
  };

  // For each UI Type
  const addJsonField = (uiField) => {
    const jsonField = {
      type: getFieldType(uiField.uiType),
      title: uiField.label,
      description: uiField.description,
    };

    if (uiField.validate) {
      if (uiField.validate.required) {
        jsonField.minLength = 1;
      }

      if (uiField.uiType === "Select") {
        jsonField.enum = uiField.validate.options.map((option) => option.value);
      }
    }

    if (uiField.uiType === "Radio" && uiField.validate.options) {
      jsonField.enum = uiField.validate.options.map((option) => option.value);
    }

    if (uiField.uiType === "Ignore" && uiField.conditions) {
      jsonField.properties = {};
      uiField.conditions.forEach((condition) => {
        const subField = addJsonField(condition);
        jsonField.properties[condition.jsonKey] = subField;
      });
    }

    if (uiField.uiType === "Group" && uiField.subParameters) {
      jsonField.properties = {};
      uiField.subParameters.forEach((subParameter) => {
        const subField = addJsonField(subParameter);
        jsonField.properties[subParameter.jsonKey] = subField;
      });
    }

    return jsonField;
  };
  // Setting up different UI types
  const getFieldType = (uiType) => {
    switch (uiType) {
      case "Input":
        return "string";
      case "Group":
        return "object";
      case "Radio":
        return "string";
      case "Ignore":
        return "object";
      case "Select":
        return "string";
      case "Switch":
        return "boolean";
      default:
        return "string";
    }
  };
  // Send Code to  the backend
  const handleFormSubmit = () => {
    const processedData = { ...formData };
    console.log("Form data to be sent to the backend:", processedData);
    setIsFormSubmitted(true);
  };
  const CustomFieldTemplate = (props) => {
    const {
      id,
      classNames,
      label,
      description,
      rawDescription,
      children,
      errors,
      help,
      displayLabel,
    } = props;
    const infoIcon = description ? (
      <span title={description}>&#9432;</span>
    ) : null;

    return (
      <div className={classNames}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {displayLabel && <label htmlFor={id}>{label}</label>}
          {infoIcon}
        </div>
        {children}
        {description && (
          <div className="field-description">{rawDescription}</div>
        )}
        {errors}
        {help}
      </div>
    );
  };

  const CustomObjectFieldTemplate = (props) => {
    return (
      <div>
        {props.properties.map((element, index) => (
          <div key={index} style={{ marginBottom: "15px" }}>
            {element.content}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
      <div style={{ flex: 1, border: "2px solid black", padding: "10px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              border: "2px solid black",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            {/* To give text area for user to Paste UI Schema */}
            <h2>UI SCHEMA</h2>
            <textarea
              value={uiSchema}
              onChange={(e) => setUiSchema(e.target.value)}
              placeholder="Paste UI Schema here..."
              style={{ width: "100%", height: "80vh", marginBottom: "10px" }}
            />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, border: "2px solid black", padding: "10px" }}>
        {/* Right Side Render Form automatically */}
        <h2>Generated Form</h2>
        {result && (
          <FormRenderer
            schema={result}
            formData={formData}
            validator={validator}
            onChange={(e) => setFormData(e.formData)}
            onSubmit={() => handleFormSubmit()}
            FieldTemplate={CustomFieldTemplate}
            ObjectFieldTemplate={CustomObjectFieldTemplate}
          />
        )}
        {isFormSubmitted && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p>Form Submitted!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Formm;
