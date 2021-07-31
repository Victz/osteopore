package com.osteopore.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class ObjectMapperConfig extends ObjectMapper {
    public ObjectMapperConfig() {

        // Deserialization

        // Just ignore unknown fields, don't stop parsing
//        configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//        // Trying to deserialize value into an enum, don't fail on unknown value, use null instead
//        configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);
//
//        // Serialization
//
//        // Don't include properties with null value in JSON output
//        setSerializationInclusion(JsonInclude.Include.NON_NULL);
//        // Use default pretty printer
//        configure(SerializationFeature.INDENT_OUTPUT, true);
    }
}
