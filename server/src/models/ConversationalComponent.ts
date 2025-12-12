import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface Command {
  command_name: string;
  command_description: string;
}

interface ConversationalComponentAttributes {
  id: number;
  userId: string;
  phoneNumberId: string;
  enableWelcomeMessage: boolean;
  prompts: string[]; // Ice breakers (max 4, 80 chars each)
  commands: Command[]; // Commands (max 30)
  welcomeMessageTemplate?: string; // Optional: template to send on request_welcome
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationalComponentCreationAttributes
  extends Optional<ConversationalComponentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ConversationalComponent
  extends Model<ConversationalComponentAttributes, ConversationalComponentCreationAttributes>
  implements ConversationalComponentAttributes
{
  public id!: number;
  public userId!: string;
  public phoneNumberId!: string;
  public enableWelcomeMessage!: boolean;
  public prompts!: string[];
  public commands!: Command[];
  public welcomeMessageTemplate?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConversationalComponent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumberId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    enableWelcomeMessage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prompts: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isValidPrompts(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Prompts must be an array');
          }
          if (value.length > 4) {
            throw new Error('Maximum 4 ice breakers allowed');
          }
          value.forEach((prompt) => {
            if (prompt.length > 80) {
              throw new Error('Each ice breaker must be 80 characters or less');
            }
          });
        },
      },
    },
    commands: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isValidCommands(value: Command[]) {
          if (!Array.isArray(value)) {
            throw new Error('Commands must be an array');
          }
          if (value.length > 30) {
            throw new Error('Maximum 30 commands allowed');
          }
          value.forEach((cmd) => {
            if (!cmd.command_name || !cmd.command_description) {
              throw new Error('Each command must have command_name and command_description');
            }
            if (cmd.command_name.length > 32) {
              throw new Error('Command name must be 32 characters or less');
            }
            if (cmd.command_description.length > 256) {
              throw new Error('Command description must be 256 characters or less');
            }
          });
        },
      },
    },
    welcomeMessageTemplate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'conversational_components',
    timestamps: true,
  }
);

export default ConversationalComponent;
