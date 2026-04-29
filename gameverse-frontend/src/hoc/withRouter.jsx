import { useNavigate, useParams } from "react-router-dom";

export function withRouter(Component) {
    function WithRouterProps(props) {
        return <Component {...props} navigate={useNavigate()} params={useParams()} />;
    }

    WithRouterProps.displayName = `withRouter(${Component.displayName || Component.name || "Component"})`;
    return WithRouterProps;
}
