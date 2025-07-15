import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import {
  Main,
  Flex,
  Box,
  Typography,
  Switch,
  Option,
  Link,
  Button,
  useNotifyAT,
  NumberInput,
} from '@strapi/design-system';

import { Select } from '@strapi/ui-primitives';

import { Layouts } from '@strapi/admin/strapi-admin';

import { useNotification } from '@strapi/strapi/admin';

import { Check } from '@strapi/icons';

import PERMISSIONS from '../../constants';
import { fetchLogSettings, putLogSettings } from './utils/api';
import schema from './utils/schema';
import getTrad from '../../utils/getTrad';

import { Page } from '@strapi/strapi/admin';

function ProtectedSettings() {
  return (
    // <Page.Protect permissions={PERMISSIONS.readSettings}>
    <Settings />
    // </Page.Protect>
  );
}

function Settings() {
  const numberOptions = ['day', 'week', 'month', 'year']; // TODO Add locales
  const { formatMessage } = useIntl(); // For getting locales
  const { toggleNotification } = useNotification(); // For error saving the form
  const { notifyStatus } = useNotifyAT(); // For saving the form

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState({});

  const [activated, setActivated] = useState(false); // For the switch element
  const [frequency, setFrequency] = useState('');
  const [frequencyNumber, setFrequencyNumber] = useState(1);
  const [frequencyInterval, setFrequencyInterval] = useState(1);
  const [interval, setInterval] = useState('');

  useEffect(() => {
    setIsLoading(true);

    fetchLogSettings()
      .then((settingsObj) => {
        notifyStatus(
          formatMessage({
            id: getTrad('settings.fetch.success'),
            defaultMessage: 'Log settings have been loaded',
          })
        );

        setActivated(settingsObj.enabled);
        setFrequency(settingsObj.frequency);
        setFrequencyNumber(settingsObj.logCount.value);
        setFrequencyInterval(settingsObj.logAge.value);
        setInterval(settingsObj.logAge.interval);
      })
      .catch(() =>
        toggleNotification({
          type: 'danger',
          message: formatMessage({
            id: getTrad('settings.fetch.error'),
            defaultMessage: 'Failed to retrieve the log settings',
          }),
        })
      )
      .finally(() => setIsLoading(false));
  }, [toggleNotification, notifyStatus]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const settings = {
      enabled: activated,
      frequency,
      logAge: {
        value: frequencyInterval,
        interval,
      },
      logCount: {
        value: frequencyNumber,
      },
    };

    try {
      schema.parse(settings);

      setIsSubmitting(true);

      putLogSettings(settings)
        .then(() => {
          toggleNotification({
            type: 'success',
            message: formatMessage({
              id: getTrad('settings.put.success'),
              defaultMessage: 'Settings saved successfully',
            }),
          });
        })
        .catch(() => {
          toggleNotification({
            type: 'danger',
            message: formatMessage({
              id: getTrad('settings.put.error'),
              defaultMessage: 'Failed to save settings',
            }),
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      setFormError({});
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <Main labelledBy="title" aria-busy="true">
        {/* <SettingsPageTitle>
          {formatMessage({
            id: getTrad('settings.title'),
            defaultMessage: 'Audit Log Settings',
          })}
        </SettingsPageTitle> */}
        <Layouts.Header
          title={formatMessage({
            id: getTrad('settings.title'),
            defaultMessage: 'Audit Log Settings',
          })}
          subtitle={formatMessage({
            id: getTrad('settings.subtitle'),
            defaultMessage: 'All settings related to the audit log plugin',
          })}
        />
        <Layouts.Content>
          <Page.Loading />
        </Layouts.Content>
      </Main>
    );
  }

  return (
    <Main labelledBy="title">
      {/* <SettingsPageTitle>
        {formatMessage({
          id: getTrad('settings.title'),
          defaultMessage: 'Audit Log Settings',
        })}
      </SettingsPageTitle> */}
      <form onSubmit={handleSubmit}>
        <Layouts.Header
          title={formatMessage({
            id: getTrad('settings.title'),
            defaultMessage: 'Audit Log Settings',
          })}
          subtitle={formatMessage({
            id: getTrad('settings.subtitle'),
            defaultMessage: 'All settings related to the audit log plugin',
          })}
          primaryAction={
            <Button loading={isSubmitting} type="submit" startIcon={<Check />} size="S">
              {formatMessage({
                id: getTrad('settings.save'),
                defaultMessage: 'Save',
              })}
            </Button>
          }
        />
        <Layouts.Content>
          <Box
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            paddingTop={6}
            paddingBottom={6}
            paddingLeft={7}
            paddingRight={7}
          >
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Box
                padding={4}
                background="primary100"
                shadow="filterShadow"
                borderColor="danger600"
              >
                <Typography>
                  {formatMessage({
                    id: getTrad('settings.box.warning'),
                    defaultMessage:
                      'The settings will be saved only for this session. Enter these settings into the configuration file for persistence. check the documentation here',
                  })}
                  <Link
                    isExternal
                    href="https://github.com/Marje3PSUT/strapi-plugin-audit-log-marje3/blob/main/README.md"
                  />
                </Typography>
              </Box>
              <Typography variant="delta" as="h2">
                {formatMessage({
                  id: getTrad('settings.box.header'),
                  defaultMessage: 'Delete frequency',
                })}
                :
              </Typography>
              <Typography>
                {formatMessage({
                  id: getTrad('settings.box.subheading'),
                  defaultMessage:
                    'This settings block determines the frequency at which the auditlogs will be deleted, and based on what criteria.',
                })}
              </Typography>
              <Switch
                selected={activated}
                value={activated}
                onChange={() => setActivated((s) => !s)}
                visibleLabels
              />
              <Flex direction="row" alignItems="center" gap={2}>
                <Typography>
                  {formatMessage({
                    id: getTrad('settings.box.frequency-input.before'),
                    defaultMessage: 'Delete based on',
                  })}
                </Typography>
                <Select.Root
                  disabled={!activated}
                  value={frequency}
                  onValueChange={(e) => setFrequency(e)}
                >
                  <Select.Portal>
                    <Select.Content>
                      <Select.Viewport>
                        <Select.Item key="log_age" value="logAge">
                          <Select.ItemText>
                            {formatMessage({
                              id: getTrad('settings.box.frequency-input.logAge'),
                              defaultMessage: 'Log Age',
                            })}
                          </Select.ItemText>
                        </Select.Item>
                        <Select.Item key="log_number" value="logCount">
                          <Select.ItemText>
                            {formatMessage({
                              id: getTrad('settings.box.frequency-input.logNumber'),
                              defaultMessage: 'Number of logs',
                            })}
                          </Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {frequency === 'logAge' && (
                  <>
                    <Typography>
                      {formatMessage({
                        id: getTrad('settings.box.frequency-input.after.logAge'),
                        defaultMessage: ', deleting logs older than',
                      })}
                    </Typography>
                    <NumberInput
                      onValueChange={(val: any) => setFrequencyInterval(val)}
                      value={frequencyInterval}
                      disabled={!activated}
                      error={formatMessage({
                        id: getTrad('settings.box.logAge-input.error'),
                        defaultMessage: 'Please enter a value greater than 1',
                      })}
                      min="1"
                    />
                    <Select.Root
                      disabled={!activated}
                      value={interval}
                      onValueChange={(e) => setInterval(e)}
                    >
                      <Select.Portal>
                        <Select.Content>
                          <Select.Viewport>
                            {numberOptions.map((option) => (
                              <Select.Item key={option} value={option}>
                                <Select.ItemText>
                                  {formatMessage({
                                    id: getTrad(`settings.box.interval-input.${option}`),
                                    defaultMessage: `${option}(s)`,
                                  })}
                                </Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </>
                )}
                {frequency === 'logCount' && (
                  <>
                    <Typography>
                      {formatMessage({
                        id: getTrad('settings.box.frequency-input.after.logCount'),
                        defaultMessage: ', persisting only the latest',
                      })}
                    </Typography>
                    <NumberInput
                      onValueChange={(val: any) => setFrequencyNumber(val)}
                      value={frequencyNumber}
                      disabled={!activated}
                      error={formatMessage({
                        id: getTrad('settings.box.logCount-input.error'),
                        defaultMessage: 'Please enter a value greater than 1',
                      })}
                      min="1"
                    />
                    <Typography>
                      {formatMessage({
                        id: getTrad('settings.box.logCount-input.after'),
                        defaultMessage: 'log records.',
                      })}
                    </Typography>
                  </>
                )}
              </Flex>
            </Flex>
          </Box>
        </Layouts.Content>
      </form>
    </Main>
  );
}

export default ProtectedSettings;
