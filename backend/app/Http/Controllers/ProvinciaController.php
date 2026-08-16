<?php

namespace App\Http\Controllers;

use App\Models\Provincia;
use App\Http\Resources\ProvinciaResource;

class ProvinciaController extends Controller
{
    public function index()
    {
        return ProvinciaResource::collection(Provincia::orderBy('nombre')->get());
    }
}