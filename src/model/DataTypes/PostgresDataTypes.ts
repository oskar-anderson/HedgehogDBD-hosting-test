import { DataTypeBoolean, DataTypeDateTimeOffset, DataTypeDecimal, DataTypeFloat, DataTypeDouble, DataTypeGuid, DataTypeInt16, DataTypeInt32, DataTypeInt64, DataTypeString, IDataTypeArgument } from "./DataType";
import IDatabaseType from "./IDatabaseType";

export default class MySqlDataTypes implements IDatabaseType {

    getBooleanText() {
        return `boolean`
    }

    getDateTimeOffsetText() {
        return `timestamptz`
    }

    getFloat128Text() {
        // alias is decimal
        return `numeric`
    }

    getFloat64Text() {
        return `double`
    }

    getFloat32Text() {
        return `real`
    }

    getGuidText() {
        return `uuid`
    }

    getInt16Text() {
        return `smallint`
    }

    getInt32Text() {
        return `int`
    }

    getInt64Text() {
        return `bigint`
    }

    getStringText() {
        return `varchar`
    }    
}
