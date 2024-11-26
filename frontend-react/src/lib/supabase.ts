import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/web';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
);

const FATAL_RESPONSE_CODES = [
  new RegExp('^22...$'),
  new RegExp('^23...$'),
  new RegExp('^42501$'),
] as const;

export class SupabaseConnector implements PowerSyncBackendConnector {
  client: SupabaseClient;

  constructor() {
    this.client = supabase;
  }

  async login(username: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      throw error;
    }
  }

  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Failed to get Supabase session: ${error}`);
    }

    return {
      endpoint: config.powersyncUrl,
      token: session.access_token ?? '',
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000)
        : undefined,
    };
  }

  async uploadData(db: AbstractPowerSyncDatabase) {
    const transaction = await db.getNextCrudTransaction();

    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        const table = this.client.from(op.table);

        let result;

        switch (op.op) {
          case UpdateType.PUT:
            const record = {
              id: op.id,
              ...op.opData,
            };
            result = await table.upsert(record);
            break;

          case UpdateType.PATCH:
            result = await table.update(op.opData).eq('id', op.id);
            break;

          case UpdateType.DELETE:
            result = await table.delete(op.opData).eq('id', op.id);
            break;
        }

        if (result.error) {
          console.error(result.error);
          result.error.message = `Error running ${
            op.op
          } on Supabase: ${JSON.stringify(result)}`;
          throw result.error;
        }
      }
    } catch (e: any) {
      console.debug(`Error in op: ${e}`);

      if (
        typeof e.code == 'string' &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(e.code))
      ) {
        console.error(`Unrecoverable error: ${e}`);
        await transaction.complete();
      } else {
        // Allow operation to be retried after a short delay
        throw e;
      }
    }

    await transaction.complete();
  }
}
