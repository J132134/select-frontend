import * as React from 'react';
import { connect } from 'react-redux';

import { HelmetWithTitle } from 'app/components';
import { ErrorContext } from 'app/components/ErrorContext';
import { MaintenanceContext } from 'app/components/MaintenanceContext';
import { ErrorStatus, PageTitleText } from 'app/constants';
import { Actions as ServiceStatusActions, ErrorResponseData, ErrorResponseStatus } from 'app/services/serviceStatus';
import { RidiSelectState } from 'app/store';

interface ErrorPageStateProps {
  responseState?: ErrorResponseStatus;
  responseData?: ErrorResponseData;
}

type Props = ErrorPageStateProps & ReturnType<typeof mapDispatchToProps>;

export class ErrorPage extends React.Component<Props> {
  public componentWillUpdate(nextProps: Props) {
    if (
      !nextProps.responseData ||
      nextProps.responseData.status !== ErrorStatus.MAINTENANCE ||
      (nextProps.responseData.period && nextProps.responseData.unavailableService)
    ) {
      return;
    }
    nextProps.requestMaintenanceData();
  }

  public render() {
    const {
      responseState = 404,
      responseData,
    } = this.props;

    return (
      <main className="SceneWrapper">
        <HelmetWithTitle titleName={PageTitleText.ERROR} />
        {responseData && responseData.period && responseData.unavailableService ?
          <MaintenanceContext responseData={responseData} /> :
          <ErrorContext responseState={responseState} />
        }
      </main>
    );
  }
}

const mapStateToProps = (state: RidiSelectState): ErrorPageStateProps => {
  return {
    responseState: state.serviceStatus.errorResponseState,
    responseData: state.serviceStatus.errorResponseData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    resetErrorState: () => dispatch(ServiceStatusActions.resetState()),
    requestMaintenanceData: () => dispatch(ServiceStatusActions.loadMaintenanceData()),
  };
};

export const ConnectedErrorPage = connect(mapStateToProps, mapDispatchToProps)(ErrorPage);
