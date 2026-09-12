<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 30px 36px; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #23252B;
            font-size: 11px;
        }

        .encabezado {
            display: table;
            width: 100%;
            margin-bottom: 18px;
            border-bottom: 3px solid #E31E24;
            padding-bottom: 12px;
        }

        .encabezado__logo {
            display: table-cell;
            vertical-align: middle;
        }

        .encabezado__logo .marca-publicidad {
            font-size: 11px;
            font-weight: 700;
            color: #17181C;
            letter-spacing: .04em;
        }

        .encabezado__logo .marca-roman {
            font-size: 20px;
            font-weight: 800;
            color: #E31E24;
            line-height: 1.1;
        }

        .encabezado__meta {
            display: table-cell;
            text-align: right;
            vertical-align: middle;
            font-size: 10px;
            color: #7A7E8C;
        }

        h1 {
            font-size: 16px;
            margin: 0 0 4px;
            color: #17181C;
        }

        .subtitulo {
            font-size: 10px;
            color: #7A7E8C;
            margin-bottom: 16px;
        }

        table.datos {
            width: 100%;
            border-collapse: collapse;
        }

        table.datos thead th {
            background: #17181C;
            color: #fff;
            text-align: left;
            padding: 6px 8px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .03em;
        }

        table.datos tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #E4E6EB;
            font-size: 10px;
        }

        table.datos tbody tr:nth-child(even) {
            background: #F4F5F7;
        }

        .totales {
            margin-top: 14px;
            text-align: right;
        }

        .totales .caja {
            display: inline-block;
            background: #FDE9E9;
            border: 1px solid #E31E24;
            border-radius: 6px;
            padding: 8px 16px;
        }

        .totales .caja span {
            font-size: 10px;
            color: #7A7E8C;
            display: block;
        }

        .totales .caja strong {
            font-size: 14px;
            color: #E31E24;
        }

        .pie {
            margin-top: 24px;
            font-size: 9px;
            color: #B0B3BD;
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="encabezado">
        <div class="encabezado__logo">
            <div class="marca-publicidad">PUBLICIDAD</div>
            <div class="marca-roman">ROMÁN MEGAVALLAS</div>
        </div>
        <div class="encabezado__meta">
            Generado por {{ $usuario->nombre }}<br>
            {{ $fecha }}
        </div>
    </div>

    <h1>Reporte de {{ $tipo }}</h1>
    <div class="subtitulo">Sistema Integral de Gestión Comercial &mdash; SIGC</div>

    <table class="datos">
        <thead>
            <tr>
                @foreach ($datos['columnas'] as $columna)
                    <th>{{ $columna }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($datos['filas'] as $fila)
                <tr>
                    @foreach ($fila as $valor)
                        <td>{{ $valor }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($datos['columnas']) }}">Sin registros para los filtros seleccionados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="totales">
        <div class="caja">
            <span>{{ $datos['totales']['label'] }}</span>
            <strong>{{ $datos['totales']['valor'] }}</strong>
        </div>
    </div>

    <div class="pie">SIGC &mdash; Publicidad Román Megavallas &middot; Documento generado automáticamente</div>

</body>
</html>
