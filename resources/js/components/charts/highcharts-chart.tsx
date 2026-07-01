import Highcharts from 'highcharts';
import {
    HighchartsReact,
    type HighchartsReactProps,
} from 'highcharts-react-official';

function HighchartsChart(props: HighchartsReactProps) {
    return <HighchartsReact highcharts={Highcharts} {...props} />;
}

export { Highcharts, HighchartsChart };
